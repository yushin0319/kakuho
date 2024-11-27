import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { EventResponse } from "../services/interfaces";
import { updateEvent } from "../services/api/event";
import { useEventData } from "../context/EventDataContext";

interface EventInfoManagerProps {
  event: EventResponse;
}

const EventInfoManager = ({ event }: EventInfoManagerProps) => {
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description || "");
  const { loading, error, changeEvent } = useEventData();

  const handleUpdate = async () => {
    try {
      await updateEvent(event.id, { name, description });
      changeEvent(event.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        label="イベント名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        disabled={loading}
      />
      <TextField
        label="詳細"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={4}
        disabled={loading}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdate}
        disabled={loading}
      >
        {loading ? "更新中..." : "更新"}
      </Button>
    </Box>
  );
};

export default EventInfoManager;
