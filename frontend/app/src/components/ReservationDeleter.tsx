import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { ReservationDetail, useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { deleteReservation } from "../services/api/reservation";
import ReservationSummary from "./ReservationSummary";

interface ReservationDeleterProps {
  reservationDetail: ReservationDetail;
  onClose: () => void;
}

const ReservationDeleter = ({
  reservationDetail: item,
  onClose,
}: ReservationDeleterProps) => {
  const { reloadData } = useAppData();
  const { setSnack } = useSnack();
  const { reservation } = item;

  const handleDeleteConfirm = async () => {
    try {
      await deleteReservation(reservation.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      setSnack({ message: "削除に失敗しました", severity: "error" });
    } finally {
      reloadData();
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

export default ReservationDeleter;
