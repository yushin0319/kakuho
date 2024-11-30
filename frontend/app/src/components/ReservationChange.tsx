// app/src/components/ReservationChange.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid2 as Grid,
  Typography,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import {
  createReservation,
  updateReservation,
  deleteReservation,
} from "../services/api/reservation";
import { StageResponse, TicketTypeResponse } from "../services/interfaces";
import { toJST } from "../services/utils";
import { useEventData } from "../context/EventDataContext";
import { ReservationDetail } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";
import { useSnack } from "../context/SnackContext";

interface ReservationChangeProps {
  reservationDetail: ReservationDetail;
  onClose: () => void;
}

// 予約変更フォームの入力値
interface ReservationChangeForm {
  stage: number;
  ticketType: number;
  numAttendees: number;
}

const ReservationChange = ({
  reservationDetail: { reservation, event, stage, seatGroup, ticketType },
  onClose,
}: ReservationChangeProps) => {
  const [step, setStep] = useState(1);
  const [selectableStages, setSelectableStages] = useState<StageResponse[]>([]);
  const [selectableTicketTypes, setSelectableTicketTypes] = useState<
    TicketTypeResponse[]
  >([]);
  const [maxAvailable, setMaxAvailable] = useState<number>(
    seatGroup.capacity + reservation.num_attendees
  );
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { addNewItem } = useNewItemContext();
  const { setSnack } = useSnack();

  // イベントデータを取得
  const {
    stages,
    seatGroups,
    ticketTypes,
    changeSeatGroup,
    loading: eventLoading,
  } = useEventData();

  // フォームの初期値を設定
  const { control, handleSubmit, watch, setValue } =
    useForm<ReservationChangeForm>({
      defaultValues: {
        stage: stage.id,
        ticketType: ticketType.id,
        numAttendees: reservation.num_attendees,
      },
    });

  const watchStage = watch("stage");
  const watchTicketType = watch("ticketType");
  const watchNumAttendees = watch("numAttendees");

  // 初期化処理
  useEffect(() => {
    if (!eventLoading) {
      const filteredStages = stages.filter(
        (stage) => stage.event_id === event.id
      );
      setSelectableStages(filteredStages);
      const groups = seatGroups.filter((group) => group.stage_id === stage.id);
      const types = ticketTypes.filter((type) =>
        groups.find((group) => group.id === type.seat_group_id)
      );
      setSelectableTicketTypes(types);
      setValue("stage", stage.id);
      setValue("ticketType", ticketType.id);
    }
  }, [eventLoading]);

  // ticketTypeを変更時、availableを再計算する処理
  useEffect(() => {
    const newTicketType = ticketTypes.find(
      (type) => type.id === watchTicketType
    );
    const newSeatGroup = seatGroups.find(
      (group) => group.id === newTicketType?.seat_group_id
    );
    const newNumAttendees = watchNumAttendees;
    if (!newSeatGroup || !newTicketType) {
      return;
    }
    const maxAvailable =
      newSeatGroup === seatGroup
        ? newSeatGroup.capacity + reservation.num_attendees
        : newSeatGroup.capacity;

    const culcMaxAvailable = Math.min(maxAvailable, 20);
    if (newNumAttendees > culcMaxAvailable) {
      setAlertMessage("予約可能な人数を超えています");
    } else {
      setAlertMessage(null);
    }
    setMaxAvailable(culcMaxAvailable);
  }, [watchTicketType, watchNumAttendees, eventLoading]);

  // stageを変更時、seatGroupとticketTypeを再計算する処理
  useEffect(() => {
    const newStage = stages.find((stage) => stage.id === watchStage);
    if (!newStage) {
      return;
    }
    const newSeatGroups = seatGroups.filter(
      (group) => group.stage_id === newStage.id
    );
    const newTicketTypes = ticketTypes.filter((type) =>
      newSeatGroups.some((group) => group.id === type.seat_group_id)
    );
    if (newSeatGroups.length === 0 || newTicketTypes.length === 0) {
      return;
    }
    const newTicketType =
      newTicketTypes.find((type) => type.type_name === ticketType.type_name) ??
      newTicketTypes[0];
    setSelectableTicketTypes(newTicketTypes);
    setValue("ticketType", newTicketType.id);
  }, [watchStage]);

  // ステップ変更処理
  const handleStepChange = (step: number) => {
    setStep(step);
  };

  // 予約の確認と確定処理
  const onSubmit = async (data: ReservationChangeForm) => {
    const user_id = reservation.user_id;
    try {
      if (ticketType.id !== data.ticketType) {
        await deleteReservation(reservation.id);
        const newItem = await createReservation(data.ticketType, {
          num_attendees: data.numAttendees,
          user_id: user_id,
        });
        addNewItem(newItem.id);
        const type = ticketTypes.find((type) => type.id === data.ticketType);
        if (!type) {
          throw new Error("TicketType not found");
        }
        changeSeatGroup(type.seat_group_id);
      } else {
        await updateReservation(reservation.id, {
          num_attendees: data.numAttendees,
          user_id: user_id,
        });
        addNewItem(reservation.id);
      }
      changeSeatGroup(seatGroup.id);
      setSnack({
        message: "予約を変更しました",
        severity: "success",
      });
    } catch (err) {
      console.error("Reservation update failed:", err);
      setSnack({
        message: "予約変更に失敗しました",
        severity: "error",
      });
    } finally {
      onClose();
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <DialogTitle>予約変更</DialogTitle>
      <DialogContent>
        {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
        {step === 1 && (
          <Grid container spacing={2} sx={{ m: 2 }}>
            <Grid size={12}>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <TextField
                    id="stage-select"
                    select
                    {...field}
                    value={
                      selectableStages.find((stage) => stage.id === watchStage)
                        ? watchStage
                        : ""
                    }
                    label="ステージ選択"
                    fullWidth
                  >
                    {selectableStages.map((stage) => (
                      <MenuItem key={stage.id} value={stage.id}>
                        {toJST(stage.start_time, "dateTime")}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="ticketType"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    {...field}
                    value={
                      selectableTicketTypes.find(
                        (type) => type.id === watchTicketType
                      )
                        ? watchTicketType
                        : ""
                    }
                    label="チケット選択"
                    fullWidth
                  >
                    {selectableTicketTypes.map((ticketType) => (
                      <MenuItem key={ticketType.id} value={ticketType.id}>
                        {ticketType.type_name} - {ticketType.price}円
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="numAttendees"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    {...field}
                    label="枚数"
                    fullWidth
                    slotProps={{
                      select: {
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 200, // メニューの最大高さ
                            },
                          },
                        },
                      },
                    }}
                  >
                    {[...Array(maxAvailable).keys()].map((num) => (
                      <MenuItem key={num + 1} value={num + 1}>
                        {num + 1}
                      </MenuItem>
                    ))}
                    {watchNumAttendees > maxAvailable && (
                      <MenuItem
                        key={watchNumAttendees}
                        value={watchNumAttendees}
                        disabled
                      >
                        {watchNumAttendees} (超過)
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        )}
        {step === 2 && (
          <Typography>
            以下の内容で予約を変更しますか？
            <br />
            ステージ:{" "}
            {toJST(
              selectableStages.find((stage) => stage.id === watchStage)
                ?.start_time,
              "dateTime"
            )}
            <br />
            チケット:{" "}
            {
              selectableTicketTypes.find((type) => type.id === watchTicketType)
                ?.type_name
            }{" "}
            -{" "}
            {
              selectableTicketTypes.find((type) => type.id === watchTicketType)
                ?.price
            }
            円
            <br />
            枚数: {watchNumAttendees}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {step === 1 && (
          <Button onClick={() => handleStepChange(2)} disabled={!!alertMessage}>
            次へ
          </Button>
        )}
        {step === 2 && (
          <>
            <Button onClick={() => handleStepChange(1)}>戻る</Button>
            <Button onClick={handleSubmit(onSubmit)}>変更</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReservationChange;
