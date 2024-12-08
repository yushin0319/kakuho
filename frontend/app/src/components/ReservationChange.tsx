// app/src/components/ReservationChange.tsx
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useEventData } from "../context/EventDataContext";
import { useNewItemContext } from "../context/NewItemContext";
import { ReservationDetail } from "../context/ReservationContext";
import { useSnack } from "../context/SnackContext";
import {
  createReservation,
  deleteReservation,
  updateReservation,
} from "../services/api/reservation";
import { StageResponse, TicketTypeResponse } from "../services/interfaces";
import { NumComma, toJST } from "../services/utils";
import ReservationSummary from "./ReservationSummary";

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
  reservationDetail: { reservation, event, stage, ticketType, seatGroup, user },
  onClose,
}: ReservationChangeProps) => {
  const [phase, setPhase] = useState<"form" | "summary">("form");
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
      onClick={(e) => {
        e.stopPropagation();
      }}
      fullWidth
    >
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        {phase === "form"
          ? "変更箇所を選択してください"
          : "変更してよろしいですか？"}
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
        }}
      >
        {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
        {phase === "form" ? (
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
                    fullWidth
                  >
                    {selectableTicketTypes.map((ticketType) => (
                      <MenuItem key={ticketType.id} value={ticketType.id}>
                        {ticketType.type_name} - {NumComma(ticketType.price)}円
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
                        {watchNumAttendees}（超過）
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        ) : (
          <ReservationSummary
            item={
              {
                reservation: {
                  ...reservation,
                  num_attendees: watchNumAttendees,
                },
                event,
                stage: selectableStages.find(
                  (stage) => stage.id === watchStage
                ),
                ticketType: selectableTicketTypes.find(
                  (type) => type.id === watchTicketType
                ),
                seatGroup,
                user,
              } as ReservationDetail
            }
          />
        )}
      </DialogContent>

      {phase === "form" ? (
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setPhase("summary")}
            disabled={!!alertMessage}
          >
            変更
          </Button>
          <Button variant="outlined" onClick={onClose}>
            キャンセル
          </Button>
        </DialogActions>
      ) : (
        <DialogActions>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
          >
            決定
          </Button>
          <Button variant="outlined" onClick={() => setPhase("form")}>
            キャンセル
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReservationChange;
