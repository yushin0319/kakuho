import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEventData } from "../context/EventDataContext";
import { useNewItemContext } from "../context/NewItemContext";
import { ReservationDetail } from "../context/ReservationContext";
import { useSnack } from "../context/SnackContext";
import { createReservation } from "../services/api/reservation";
import {
  EventResponse,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { NumComma, toJST } from "../services/utils";
import ReservationSummary from "./ReservationSummary";

interface ReservationCreaterProps {
  event: EventResponse;
  stage: StageResponse;
  onClose: () => void;
}

// 予約作成フォームの入力値
interface ReservationCreaterForm {
  ticketType: number | "";
  numAttendees: number;
}

const ReservationCreater = ({
  event,
  stage,
  onClose,
}: ReservationCreaterProps) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [selectableTicketTypes, setSelectableTicketTypes] = useState<
    TicketTypeResponse[]
  >([]);
  const [maxAvailable, setMaxAvailable] = useState<number>(1);
  const [phase, setPhase] = useState<"form" | "summary">("form");
  const { addNewItem } = useNewItemContext();
  const { setSnack } = useSnack();
  const { user } = useAuth();
  const {
    seatGroups,
    ticketTypes,
    changeSeatGroup,
    loading: eventLoading,
  } = useEventData();

  const { control, handleSubmit, watch, setValue } =
    useForm<ReservationCreaterForm>({
      defaultValues: {
        ticketType: "",
        numAttendees: 1,
      },
    });

  const watchTicketType = watch("ticketType");
  const watchNumAttendees = watch("numAttendees");

  // 初期化処理
  useEffect(() => {
    if (!eventLoading) {
      const groups = seatGroups.filter((group) => group.stage_id === stage.id);
      const types = ticketTypes.filter((type) =>
        groups.find((group) => group.id === type.seat_group_id)
      );
      setSelectableTicketTypes(types);
      setValue("ticketType", types[0]?.id || "");
      setMaxAvailable(
        groups.find((group) => group.id === types[0]?.seat_group_id)
          ?.capacity || 0
      );
    }
  }, [eventLoading, stage]);

  // ticketTypeを変更時、availableを再計算
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

    // 予約可能な人数を計算
    const culcMaxAvailable = Math.min(newSeatGroup.capacity, 20);
    if (newNumAttendees > culcMaxAvailable) {
      setAlertMessage("予約可能な人数を超えています");
    } else {
      setAlertMessage(null);
    }
    setMaxAvailable(culcMaxAvailable);
  }, [watchTicketType, watchNumAttendees, ticketTypes, seatGroups]);

  // 予約作成処理
  const onSubmit = async (data: ReservationCreaterForm) => {
    if (data.ticketType === "" || !user) {
      setAlertMessage("チケットタイプを選択してください");
      return;
    }
    try {
      const newItem = await createReservation(data.ticketType, {
        num_attendees: data.numAttendees,
        user_id: user.id,
      });
      addNewItem(newItem.id);
      const newSeatGroup = seatGroups.find(
        (group) =>
          group.id ===
          ticketTypes.find((type) => type.id === data.ticketType)?.seat_group_id
      );
      if (newSeatGroup) {
        changeSeatGroup(newSeatGroup.id);
      }
      setSnack({
        message: "予約を作成しました",
        severity: "success",
      });
    } catch (err) {
      console.error("Reservation create failed:", err);
      setSnack({
        message: "予約作成に失敗しました",
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
        <Typography variant="h6" component="div">
          {phase === "form"
            ? "券種と人数を選択して下さい"
            : "予約してよろしいですか？"}
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
        }}
      >
        {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
        {phase === "form" ? (
          <Box>
            <Box
              sx={{
                m: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2">{event.name}</Typography>
              <Typography variant="body1">
                {toJST(stage.start_time, "dateTime")}
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ m: 2 }}>
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
                          {ticketType.type_name} - {NumComma(ticketType.price)}
                          円
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
          </Box>
        ) : (
          <ReservationSummary
            item={
              {
                event: event,
                stage: stage,
                ticketType: selectableTicketTypes.find(
                  (type) => type.id === watchTicketType
                )!,
                seatGroup: seatGroups.find(
                  (group) =>
                    group.id ===
                    selectableTicketTypes.find(
                      (type) => type.id === watchTicketType
                    )?.seat_group_id
                )!,
                user: user,
              } as Omit<ReservationDetail, "reservation">
            }
            num_attendees={watchNumAttendees}
          />
        )}
      </DialogContent>
      {phase === "form" ? (
        <DialogActions>
          <Button
            onClick={() => setPhase("summary")}
            variant="contained"
            color="primary"
            disabled={!!alertMessage}
          >
            予約
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
            確定
          </Button>
          <Button
            onClick={() => setPhase("form")}
            variant="outlined"
            color="primary"
          >
            キャンセル
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReservationCreater;
