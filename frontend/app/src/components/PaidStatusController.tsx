import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useReservationContext } from "../context/ReservationContext";
import { updateReservation } from "../services/api/reservation";
import ReservationSummary from "./ReservationSummary";

interface PaidStatusControllerProps {
  reservationId: number;
  onClose: () => void;
}

const PaidStatusController = ({
  reservationId,
  onClose,
}: PaidStatusControllerProps) => {
  const { reservations, reloadReservations } = useReservationContext();

  // 該当する予約を直接取得
  const reservation = reservations.find(
    (res) => res.reservation.id === reservationId
  );

  const handlePaidStatusChange = async () => {
    if (!reservation) return;
    try {
      await updateReservation(reservation.reservation.id, {
        user_id: reservation.user.id,
        is_paid: !reservation.reservation.is_paid,
      });
    } catch (error) {
      console.error("Failed to update reservation:", error);
    } finally {
      reloadReservations();
      onClose();
    }
  };

  if (!reservation) {
    return (
      <Dialog open onClose={onClose}>
        <DialogTitle>予約が見つかりません</DialogTitle>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle
        sx={{
          backgroundColor: reservation.reservation.is_paid
            ? "error.main"
            : "primary.main",
          color: reservation.reservation.is_paid
            ? "error.contrastText"
            : "white",
        }}
      >
        {reservation.reservation.is_paid
          ? "未受付に戻しますか？"
          : "下記の予約を受付いたします"}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <ReservationSummary item={reservation} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color={reservation.reservation.is_paid ? "error" : "primary"}
          onClick={handlePaidStatusChange}
        >
          {reservation.reservation.is_paid ? "受付取消" : "受付完了"}
        </Button>
        <Button
          variant="outlined"
          color={reservation.reservation.is_paid ? "error" : "primary"}
          onClick={onClose}
        >
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaidStatusController;
