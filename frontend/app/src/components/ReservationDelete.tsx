import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  Box,
  Grid2 as Grid,
} from "@mui/material";
import { toJST } from "../services/utils";
import { deleteReservation } from "../services/api/reservation";
import { ReservationDetail } from "../context/ReservationContext";
import { useEventData } from "../context/EventDataContext";

interface ReservationDeleteProps {
  reservationDetail: ReservationDetail;
  onClose: () => void;
}

const ReservationDelete = ({
  reservationDetail: { reservation, seatGroup, event, ticketType, stage },
  onClose,
}: ReservationDeleteProps) => {
  const { changeSeatGroup } = useEventData();

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
      <DialogTitle>予約を削除しますか？</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom color="warning">
          この操作は取り消せません。
        </Typography>
        <Card sx={{ p: 2 }} elevation={2}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="subtitle2" color="secondary">
                  イベント
                </Typography>
                <Typography>{event.name}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="secondary">
                  日時
                </Typography>
                <Typography>{toJST(stage.start_time, "dateTime")}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="secondary">
                  チケット
                </Typography>
                <Typography>{ticketType.type_name}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="secondary">
                  価格
                </Typography>
                <Typography>{ticketType.price}円</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="secondary">
                  枚数
                </Typography>
                <Typography>{reservation.num_attendees}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="secondary">
                  合計
                </Typography>
                <Typography>
                  {ticketType.price * reservation.num_attendees}円
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
          削除
        </Button>
        <Button variant="outlined" onClick={onClose}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationDelete;
