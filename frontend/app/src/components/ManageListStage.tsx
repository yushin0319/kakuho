import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { Box, Button, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useEventData } from "../context/EventDataContext";
import { StageResponse } from "../services/interfaces";
import { toJST } from "../services/utils";
import ManageListSeatGroup from "./ManageListSeatGroup";
import ScannerModal from "./ScannerModal";

interface ManageListStageProps {
  stage: StageResponse;
  isOpen: boolean;
  toggle: () => void;
}

const ManageListStage = ({ stage, isOpen, toggle }: ManageListStageProps) => {
  const [openSeatGroupIds, setOpenSeatGroupIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { seatGroups } = useEventData();

  useEffect(() => {
    if (!isOpen) {
      setOpenSeatGroupIds([]); // ステージが閉じられたら座席グループも閉じる
    }
  }, [isOpen]);

  const toggleSeatGroup = (id: number) => {
    setOpenSeatGroupIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((groupId) => groupId !== id)
        : [...prevIds, id]
    );
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box
      sx={{
        mt: 2,
        mb: 1,
        border: "1px solid #ddd",
        borderRadius: 2,
        py: 1,
      }}
    >
      {/* ヘッダー部分 */}
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
          variant="h6"
          color="secondary"
          fontWeight="bold"
          sx={{ ml: 1 }}
        >
          {toJST(stage.start_time, "dateTime")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<QrCodeIcon />}
            onClick={handleOpenModal}
          >
            QR受付
          </Button>
          <IconButton size="small">
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* モーダル */}
      {isModalOpen && (
        <ScannerModal stageId={stage.id} onClose={handleCloseModal} />
      )}

      {/* 座席グループ */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          {seatGroups
            .filter((group) => group.stage_id === stage.id)
            .map((group) => (
              <ManageListSeatGroup
                key={group.id}
                seatGroup={group}
                isOpen={openSeatGroupIds.includes(group.id)}
                toggle={() => toggleSeatGroup(group.id)}
              />
            ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ManageListStage;
