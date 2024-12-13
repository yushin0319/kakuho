// app/src/components/ManageItem.tsx
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
import { ReservationDetail } from "../context/AppData";
import { NumComma } from "../services/utils";
import PaidStatusController from "./PaidStatusController";
import ReservationChanger from "./ReservationChanger";
import ReservationDeleter from "./ReservationDeleter";

const CheckInItem = ({ data }: { data: ReservationDetail }) => {
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
      <Box>
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
      {isChanging && (
        <ReservationChanger
          reservationDetail={data}
          onClose={() => setIsChanging(false)}
        />
      )}
      {isDeleting && (
        <ReservationDeleter
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

export default CheckInItem;
