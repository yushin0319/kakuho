import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { updateEvent } from "../services/api/event";
import { EventResponse } from "../services/interfaces";

interface EventInfoManagerProps {
  event: EventResponse;
}

const EventInfoManager = ({ event }: EventInfoManagerProps) => {
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description || "");
  const { loading, error, reloadData } = useAppData();
  const { setSnack } = useSnack();

  const handleUpdate = async () => {
    try {
      await updateEvent(event.id, { name, description });
      reloadData();
      setSnack({ message: "正常に保存されました", severity: "success" });
    } catch (e) {
      console.error(e);
      setSnack({ message: "保存中にエラーが発生しました", severity: "error" });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {error && <Typography color="error">{error}</Typography>}
      <Box display="flex" flexDirection="column">
        <Typography variant="body2" sx={{ mb: 2 }}>
          イベント情報の編集
        </Typography>
        <Typography variant="caption" color="text.secondary">
          情報の変更は即時反映されません。
        </Typography>
        <Typography variant="caption" color="text.secondary">
          変更後、保存ボタンを押してください。
        </Typography>
      </Box>
      <TextField
        label="イベント名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        disabled={loading}
      />
      <TextField
        label="イベント説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
        disabled={loading}
      />
      <Button variant="contained" color="primary" onClick={handleUpdate}>
        保存
      </Button>
    </Box>
  );
};

export default EventInfoManager;
