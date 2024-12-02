// app/src/components/ManageItem.tsx
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { Box, Checkbox, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { ReservationDetail } from "../context/ReservationContext";
import PaidStatusController from "./PaidStatusController";
import ReservationChange from "./ReservationChange";
import ReservationDelete from "./ReservationDelete";

const ManageListItem = ({ data }: { data: ReservationDetail }) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { reservation, user, ticketType } = data;

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
        borderBottom: "1px solid #ddd",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox checked={reservation.is_paid} onChange={handlePaying} />
        <Typography variant="body2">{user.nickname || user.email}</Typography>
        <Typography variant="body2">{ticketType.type_name}</Typography>
        <Typography variant="body2">{reservation.num_attendees}</Typography>
        <Typography variant="body2">
          {ticketType.price * reservation.num_attendees}円
        </Typography>
      </Box>
      <Box>
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
