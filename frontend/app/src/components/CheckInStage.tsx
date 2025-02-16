import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { Box, Button, Collapse, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppData } from "../context/AppData";
import { StageResponse } from "../services/interfaces";
import { toJST } from "../services/utils";
import CheckInSeatGroup from "./CheckInSeatGroup";
import ScannerModal from "./ScannerModal";

interface CheckInStageProps {
  stage: StageResponse;
  isOpen: boolean;
  toggle: () => void;
}

const CheckInStage = ({ stage, isOpen, toggle }: CheckInStageProps) => {
  const [openSeatGroupIds, setOpenSeatGroupIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { seatGroups } = useAppData();

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
          px: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          sx={{ ml: 1 }}
        >
          {toJST(stage.start_time, "dateTime")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton size="small">
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* 座席グループ */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<QrCodeIcon />}
            onClick={handleOpenModal}
            sx={{ mb: 2 }}
          >
            QR受付
          </Button>
          {seatGroups
            .filter((group) => group.stage_id === stage.id)
            .map((group) => (
              <CheckInSeatGroup
                key={group.id}
                seatGroup={group}
                isOpen={openSeatGroupIds.includes(group.id)}
                toggle={() => toggleSeatGroup(group.id)}
              />
            ))}
        </Box>
      </Collapse>

      {/* モーダル */}
      {isModalOpen && (
        <ScannerModal stageId={stage.id} onClose={handleCloseModal} />
      )}
    </Box>
  );
};

export default CheckInStage;
