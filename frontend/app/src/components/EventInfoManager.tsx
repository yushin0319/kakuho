import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useEventData } from "../context/EventDataContext";
import { useSnack } from "../context/SnackContext";
import { updateEvent } from "../services/api/event";
import { EventResponse } from "../services/interfaces";

interface EventInfoManagerProps {
  event: EventResponse;
}

const EventInfoManager = ({ event }: EventInfoManagerProps) => {
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description || "");
  const { loading, error, changeEvent } = useEventData();
  const { setSnack } = useSnack();

  const handleUpdate = async () => {
    try {
      await updateEvent(event.id, { name, description });
      changeEvent(event.id);
      setSnack({ message: "正常に保存されました", severity: "success" });
    } catch (e) {
      console.error(e);
      setSnack({ message: "保存中にエラーが発生しました", severity: "error" });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {error && <Typography color="error">{error}</Typography>}
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
