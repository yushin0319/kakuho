import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  Grid2 as Grid,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useAppData } from "../context/AppData";
import { SeatGroupResponse } from "../services/interfaces";
import CheckInItem from "./CheckInItem";

interface CheckInSeatGroupProps {
  seatGroup: SeatGroupResponse;
  isOpen: boolean;
  toggle: () => void;
}

const CheckInSeatGroup = ({
  seatGroup,
  isOpen,
  toggle,
}: CheckInSeatGroupProps) => {
  const { seatGroupNames, reservations } = useAppData();

  // 予約数とパーセンテージを計算 (useMemoで効率化)
  const { totalReservations, totalSeats, occupancyRate, paidRate } =
    useMemo(() => {
      const filteredReservations = reservations.filter(
        (data) => data.seatGroup.id === seatGroup.id
      );
      const total = filteredReservations.reduce(
        (acc, data) => acc + data.reservation.num_attendees,
        0
      );
      const paid = filteredReservations.reduce(
        (acc, data) =>
          acc + (data.reservation.is_paid ? data.reservation.num_attendees : 0),
        0
      );
      const totalCapacity = total + seatGroup.capacity;
      return {
        totalReservations: total,
        totalSeats: totalCapacity,
        occupancyRate: Math.round((total / totalCapacity) * 100),
        paidRate: Math.round((paid / totalCapacity) * 100),
      };
    }, [seatGroup.id, reservations]);

  return (
    <Box
      sx={{
        mb: 1,
        borderRadius: 1,
        p: 1,
      }}
    >
      {/* ヘッダー部分 */}
      <Grid
        container
        spacing={1}
        sx={{
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={toggle}
      >
        <Grid size={3}>
          <Typography variant="body2" color="primary" fontWeight="bold">
            {seatGroupNames[seatGroup.id]?.join("/")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            定員 {totalSeats}席
          </Typography>
          <Typography
            variant="caption"
            color={seatGroup.capacity === 0 ? "error" : "success.main"}
          >
            残り {seatGroup.capacity}席
          </Typography>
        </Grid>
        <Grid size={7}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={occupancyRate}
              sx={{
                height: 20,
                mb: 1,
                borderRadius: 1,
              }}
            />
            <LinearProgress
              variant="determinate"
              value={paidRate}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 20,
                zIndex: 1,
                opacity: 0.4,
                borderRadius: 1,
              }}
            />
          </Box>
        </Grid>
        <Grid size={2}>
          <IconButton size="small">
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Grid>
      </Grid>

      {/* 予約一覧 (Collapseで開閉) */}
      <Collapse in={isOpen}>
        {isOpen && (
          <Box sx={{ mt: 2 }}>
            {reservations
              .filter((data) => data.seatGroup.id === seatGroup.id)
              .sort((a, b) => {
                const nameA = a.user.nickname || a.user.email;
                const nameB = b.user.nickname || b.user.email;
                return nameA.localeCompare(nameB); // 名前順
              })
              .sort(
                (a, b) =>
                  Number(a.reservation.is_paid) - Number(b.reservation.is_paid) // 支払い順
              )
              .map((data, index) => (
                <Box
                  key={data.reservation.id}
                  sx={{
                    backgroundColor: data.reservation.is_paid
                      ? "rgba(0, 0, 0, 0.2)"
                      : index % 2 === 0
                      ? "inherit"
                      : "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <CheckInItem data={data} />
                </Box>
              ))}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default CheckInSeatGroup;
