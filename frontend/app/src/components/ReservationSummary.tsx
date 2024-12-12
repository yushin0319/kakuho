import { Box, Grid2 as Grid, Typography } from "@mui/material";
import { ReservationDetail } from "../context/AppData";
import { NumComma, toJST } from "../services/utils";

type ReservationSummaryProps =
  | {
      item: ReservationDetail;
      num_attendees?: never;
    }
  | {
      item: Omit<ReservationDetail, "reservation">;
      num_attendees: number;
    };

const ReservationSummary = ({
  item,
  num_attendees,
}: ReservationSummaryProps) => {
  const { event, user, ticketType, stage } = item;
  const attendees =
    "reservation" in item ? item.reservation.num_attendees : num_attendees;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mt: 0 }}>
        <Grid container spacing={1}>
          <Grid size={12} textAlign="right">
            <Typography
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {event.name}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" color="secondary">
              ご予約名
            </Typography>
            <Typography
              variant="h6"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: "bold",
              }}
            >
              {user.nickname || user.email}
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Typography variant="subtitle2" color="secondary">
              日時
            </Typography>
            <Typography variant="h6">
              {toJST(stage.start_time, "fullDate")}{" "}
              {toJST(stage.start_time, "time")}
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 4,
              md: 2,
            }}
          >
            <Typography variant="subtitle2" color="secondary">
              チケット
            </Typography>
            <Typography variant="h6">{ticketType.type_name}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 4,
              md: 2,
            }}
          >
            <Typography variant="subtitle2" color="secondary">
              ご人数
            </Typography>
            <Typography variant="h6">{attendees}名</Typography>
          </Grid>
          <Grid
            size={{
              xs: 4,
              md: 2,
            }}
            textAlign="center"
          >
            <Typography variant="subtitle2" color="secondary">
              合計金額
            </Typography>
            <Typography variant="h6">
              {attendees ? NumComma(ticketType.price * attendees) : "-"}円
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ReservationSummary;
