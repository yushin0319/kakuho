import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEventData } from "../context/EventDataContext";
import { ReservationDetail } from "../context/ReservationContext";
import { deleteReservation } from "../services/api/reservation";
import ReservationSummary from "./ReservationSummary";

interface ReservationDeleteProps {
  reservationDetail: ReservationDetail;
  onClose: () => void;
}

const ReservationDelete = ({
  reservationDetail: item,
  onClose,
}: ReservationDeleteProps) => {
  const { changeSeatGroup } = useEventData();
  const { reservation, seatGroup } = item;

  const handleDeleteConfirm = async () => {
    try {
      await deleteReservation(reservation.id);
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    } finally {
      changeSeatGroup(seatGroup.id);
      onClose();
    }
  };

  return (
    <Dialog open onClose={onClose} onClick={(e) => e.stopPropagation()}>
      <DialogTitle
        sx={{
          backgroundColor: "error.main",
          color: "error.contrastText",
        }}
      >
        <Typography variant="h6" component="div">
          下記の予約を削除しますか？
        </Typography>
        <Typography variant="body1" color="error.contrastText">
          この操作は取り消せません。
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <ReservationSummary item={item} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
          削除
        </Button>
        <Button variant="outlined" color="error" onClick={onClose}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationDelete;
