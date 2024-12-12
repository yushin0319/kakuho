import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Card, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppData } from "../context/AppData";
import { EventResponse } from "../services/interfaces";
import ManageListStage from "./ManageListStage";

interface ManageListEventProps {
  event: EventResponse;
  isOpen: boolean;
  toggle: () => void;
}

const ManageListEvent = ({ event, isOpen, toggle }: ManageListEventProps) => {
  const [openStageIds, setOpenStageIds] = useState<number[]>([]);
  const { stages } = useAppData();

  useEffect(() => {
    if (!isOpen) {
      setOpenStageIds([]); // イベントが閉じられたらステージも閉じる
    }
  }, [isOpen]);

  const toggleStage = (id: number) => {
    setOpenStageIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((stageId) => stageId !== id)
        : [...prevIds, id]
    );
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 1,
        p: 1,
      }}
    >
      {/* イベントヘッダー */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        <Typography
          variant="body1"
          sx={{
            width: "100%",
            m: 1,
          }}
        >
          {event.name}
        </Typography>
        <IconButton size="small">
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* ステージリスト */}
      <Collapse in={isOpen} timeout="auto">
        <Box>
          {stages
            .filter((stage) => stage.event_id === event.id)
            .map((stage) => (
              <ManageListStage
                key={stage.id}
                stage={stage}
                isOpen={openStageIds.includes(stage.id)}
                toggle={() => toggleStage(stage.id)}
              />
            ))}
        </Box>
      </Collapse>
    </Card>
  );
};

export default ManageListEvent;
