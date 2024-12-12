// app/src/components/ManageItem.tsx
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { ReservationDetail } from "../context/ReservationContext";
import { NumComma } from "../services/utils";
import PaidStatusController from "./PaidStatusController";
import ReservationChange from "./ReservationChange";
import ReservationDelete from "./ReservationDelete";

const ManageListItem = ({ data }: { data: ReservationDetail }) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { reservation, user, ticketType } = data;
  const [openMenu, setOpenMenu] = useState<{
    anchor: HTMLElement | null;
  }>({ anchor: null });

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenMenu({ anchor: event.currentTarget });
  };

  const handlePaying = () => {
    setIsPaying(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1,
      }}
    >
      <Checkbox
        id={reservation.id.toString()}
        checked={reservation.is_paid}
        onChange={handlePaying}
        sx={{ mr: 1 }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "left",
          width: "100%",
          cursor: "pointer",
        }}
        onClick={handlePaying}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.nickname || user.email}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" color="textSecondary">
            {ticketType.type_name} × {reservation.num_attendees}枚
          </Typography>
          <Typography variant="body2">
            {NumComma(ticketType.price * reservation.num_attendees)}円
          </Typography>
        </Box>
      </Box>
      {/* スマホ用 */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <IconButton onClick={(e) => handleMenuClick(e)}>
          <SettingsIcon />
        </IconButton>
        <Menu
          anchorEl={openMenu.anchor}
          open={Boolean(openMenu.anchor)}
          onClose={() => setOpenMenu({ anchor: null })}
        >
          <MenuItem
            onClick={() => {
              setIsChanging(true);
              setOpenMenu({ anchor: null });
            }}
          >
            変更
          </MenuItem>
          <MenuItem
            onClick={() => {
              setIsDeleting(true);
              setOpenMenu({ anchor: null });
            }}
          >
            削除
          </MenuItem>
        </Menu>
      </Box>
      {/* PC用 */}
      <Box
        display="flex"
        sx={{
          display: { xs: "none", sm: "block" },
          width: { xs: "100%", sm: "30%" },
        }}
      >
        <IconButton onClick={() => setIsChanging(true)}>
          <ModeEditIcon color="primary" />
        </IconButton>
        <IconButton onClick={() => setIsDeleting(true)}>
          <DeleteForeverIcon color="error" />
        </IconButton>
      </Box>
      {isChanging && (
        <ReservationChange
          reservationDetail={data}
          onClose={() => setIsChanging(false)}
        />
      )}
      {isDeleting && (
        <ReservationDelete
          reservationDetail={data}
          onClose={() => setIsDeleting(false)}
        />
      )}
      {isPaying && (
        <PaidStatusController
          reservationId={reservation.id}
          onClose={() => setIsPaying(false)}
        />
      )}
    </Box>
  );
};

export default ManageListItem;
