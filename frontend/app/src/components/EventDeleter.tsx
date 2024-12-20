import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { deleteEvent } from "../services/api/event";
import { deleteSeatGroup } from "../services/api/seatGroup";
import { deleteStage } from "../services/api/stage";
import { deleteTicketType } from "../services/api/ticketType";
import { EventResponse } from "../services/interfaces";

const EventDeleter = ({ event }: { event: EventResponse }) => {
  const { stages, seatGroups, ticketTypes, reservations, reloadData } =
    useAppData();
  const { setSnack } = useSnack();
  const [open, setOpen] = useState(false);
  const hasReservations = reservations.some((r) => r.event.id === event.id);

  const handleDelete = async () => {
    try {
      const filteredStages = stages.filter(
        (stage) => stage.event_id === event.id
      );
      const filteredSeatGroups = seatGroups.filter((sg) =>
        filteredStages.some((stage) => stage.id === sg.stage_id)
      );
      const filteredTicketTypes = ticketTypes.filter((tt) =>
        filteredSeatGroups.some((sg) => sg.id === tt.seat_group_id)
      );

      // 並列で削除
      await Promise.all(
        filteredTicketTypes.map((tt) => deleteTicketType(tt.id))
      );
      await Promise.all(filteredSeatGroups.map((sg) => deleteSeatGroup(sg.id)));
      await Promise.all(filteredStages.map((stage) => deleteStage(stage.id)));

      await deleteEvent(event.id);

      setSnack({ message: "イベントを削除しました", severity: "success" });
      setOpen(false);
    } catch (e) {
      console.error(e);
      setSnack({ message: "イベントの削除に失敗しました", severity: "error" });
    }
    reloadData();
  };

  return (
    <Box display="flex" flexDirection="column">
      <Typography variant="body2" sx={{ mb: 2 }}>
        イベントの削除
      </Typography>
      <Typography variant="caption" color="text.secondary">
        予約の存在するイベントは削除できません。
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        予約管理画面からキャンセルしてください。
      </Typography>
      {hasReservations && (
        <Typography color="error" variant="body2">
          予約が存在するため、削除できません。
        </Typography>
      )}
      <Button
        variant="contained"
        color="error"
        onClick={() => setOpen(true)}
        disabled={hasReservations}
        sx={{ mt: 2 }}
      >
        削除
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>イベントを削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>
            この操作は取り消せません。本当に削除しますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={handleDelete} color="error">
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDeleter;
