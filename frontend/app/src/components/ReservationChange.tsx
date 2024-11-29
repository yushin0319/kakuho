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
import {
  createReservation,
  updateReservation,
  deleteReservation,
} from "../services/api/reservation";
import {
  StageResponse,
  SeatGroupResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { toJST } from "../services/utils";
import { useEventData } from "../context/EventDataContext";
import { ReservationDetail } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";
import "../assets/styles/ReservationChange.scss";

interface ReservationChangeProps {
  reservationDetail: ReservationDetail;
  onClose: () => void;
}

const ReservationChange = ({
  reservationDetail: { reservation, event, stage, seatGroup, ticketType },
  onClose,
}: ReservationChangeProps) => {
  const [step, setStep] = useState(1);
  const [newStage, setNewStage] = useState<StageResponse>(stage);
  const [newSeatGroup, setNewSeatGroup] =
    useState<SeatGroupResponse>(seatGroup);
  const [newTicketType, setNewTicketType] =
    useState<TicketTypeResponse>(ticketType);
  const [selectableStages, setSelectableStages] = useState<StageResponse[]>([]);
  const [selectableTicketTypes, setSelectableTicketTypes] = useState<
    TicketTypeResponse[]
  >([]);
  const [newNumAttendees, setNewNumAttendees] = useState<number>(
    reservation.num_attendees
  );
  const [maxAvailable, setMaxAvailable] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { addNewItem } = useNewItemContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {
    stages,
    seatGroups,
    ticketTypes,
    changeSeatGroup,
    loading: eventLoading,
  } = useEventData();

  // 初期化処理
  useEffect(() => {
    setMaxAvailable(seatGroup.capacity + reservation.num_attendees);
    const filteredStages = stages.filter(
      (stage) => stage.event_id === event.id
    );
    setSelectableStages(filteredStages);
    const groups = seatGroups.filter((group) => group.stage_id === stage.id);
    const types = ticketTypes.filter((type) =>
      groups.find((group) => group.id === type.seat_group_id)
    );
    setSelectableTicketTypes(types);
  }, []);

  // ticketTypeを変更時、availableを再計算する処理
  useEffect(() => {
    const loadCapacity = () => {
      const newAvailable = newSeatGroup.capacity;
      const available =
        newSeatGroup.id === seatGroup.id
          ? newAvailable + reservation.num_attendees
          : newAvailable;
      setMaxAvailable(available);
    };
    loadCapacity();
  }, [newTicketType, eventLoading]);

  // 人数超過の検知処理
  useEffect(() => {
    if (newNumAttendees > maxAvailable) {
      setAlertMessage("申し訳ございません。ご希望のチケットは満席です。");
    } else {
      setAlertMessage(null);
    }
    setIsLoading(false);
  }, [maxAvailable, newNumAttendees, eventLoading]);

  // ステージ選択の変更処理
  const handleStageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(e.target.value);
    const selectedStage = stages.find((stage) => stage.id === id);
    if (!selectedStage) {
      return;
    }
    const newSeatGroups = seatGroups.filter((group) => group.stage_id === id);
    const newTicketTypes = ticketTypes.filter((type) =>
      newSeatGroups.some((group) => group.id === type.seat_group_id)
    );
    if (newSeatGroups.length === 0 || newTicketTypes.length === 0) {
      return;
    }
    const newSeatGroup = stage === selectedStage ? seatGroup : newSeatGroups[0];
    const newTicketType =
      selectedStage === stage ? ticketType : newTicketTypes[0];
    setNewStage(selectedStage);
    setNewSeatGroup(newSeatGroup);
    setSelectableTicketTypes(newTicketTypes);
    setNewTicketType(newTicketType);
  };

  // チケットタイプ選択の変更処理
  const handleTicketTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = parseInt(e.target.value);
    const newTicketType = ticketTypes.find((type) => type.id === id);
    const newSeatGroup = seatGroups.find(
      (group) => group.id === newTicketType?.seat_group_id
    );
    const newStage = stages.find(
      (stage) => stage.id === newSeatGroup?.stage_id
    );
    if (!newStage || !newSeatGroup || !newTicketType) {
      return;
    }
    setNewStage(newStage);
    setNewSeatGroup(newSeatGroup);
    setNewTicketType(newTicketType);
  };

  // 予約人数の変更処理
  const handleNumAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const attendees = parseInt(e.target.value);
    setNewNumAttendees(attendees);
  };

  // ステップ変更処理
  const handleStepChange = (step: number) => {
    setStep(step);
  };

  // 予約の確認と確定処理
  const handleConfirm = async () => {
    const user_id = reservation.user_id;
    try {
      if (ticketType !== newTicketType) {
        await deleteReservation(reservation.id);
        const newItem = await createReservation(newTicketType.id, {
          num_attendees: newNumAttendees,
          user_id: user_id,
        });
        addNewItem(newItem.id);
      } else {
        await updateReservation(reservation.id, {
          num_attendees: newNumAttendees,
          user_id: user_id,
        });
        addNewItem(reservation.id);
      }
      changeSeatGroup(seatGroup.id);
      changeSeatGroup(newSeatGroup.id);
    } catch (err) {
      console.error("Reservation update failed:", err);
    } finally {
      onClose();
    }
  };

  if (isLoading || eventLoading) {
    return <div>Loading...</div>;
  }

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
              <TextField
                select
                name="stage"
                label="ステージ選択"
                value={newStage.id}
                onChange={handleStageChange}
                fullWidth
              >
                {selectableStages.map((stage) => (
                  <MenuItem key={stage.id} value={stage.id}>
                    {toJST(stage.start_time, "dateTime")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select
                name="ticketType"
                label="チケット選択"
                value={newTicketType.id}
                onChange={handleTicketTypeChange}
                fullWidth
              >
                {selectableTicketTypes.map((ticketType) => (
                  <MenuItem key={ticketType.id} value={ticketType.id}>
                    {ticketType.type_name} - {ticketType.price}円
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                type="number"
                label="枚数"
                value={newNumAttendees}
                onChange={handleNumAttendeesChange}
                fullWidth
                inputProps={{ min: 1, max: maxAvailable }}
              />
            </Grid>
          </Grid>
        )}
        {step === 2 && (
          <Typography>
            {toJST(newStage.start_time, "dateTime")} - {newTicketType.type_name}{" "}
            - {newNumAttendees}枚
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
            <Button onClick={handleConfirm}>確定</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReservationChange;
