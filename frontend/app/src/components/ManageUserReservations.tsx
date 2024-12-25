import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppData } from "../context/AppData";
import { toJST } from "../services/utils";

const ManageUserReservations = ({ userId }: { userId: number }) => {
  const { reservations } = useAppData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const userReservations = reservations.filter((res) => res.user.id === userId);

  if (userReservations.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          現在、予約はありません。
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {isMobile ? (
        // スマホ表示: カード形式
        userReservations.map(({ event, stage, ticketType, reservation }) => (
          <Card
            key={reservation.id}
            sx={{
              mb: 2,
              borderLeft: reservation.is_paid
                ? "4px solid #80cbc4"
                : "4px solid #f44336",
            }}
          >
            <CardContent>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <Typography variant="h6">{event.name}</Typography>
                </Grid>
                <Grid size={8}>
                  <Typography variant="body2" color="text.secondary">
                    日時：{toJST(stage.start_time, "dateTime")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="body2">
                    {ticketType.type_name}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Divider />
                </Grid>
                <Grid size={8}>
                  <Typography variant="body2" color="secondary">
                    予約：{toJST(reservation.created_at, "dateTime")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography
                    variant="body2"
                    color={reservation.is_paid ? "secondary" : "error.main"}
                  >
                    {reservation.is_paid ? "受付済" : "受付前"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : (
        // PC表示: テーブル形式
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body1">イベント</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">ステージ</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">チケット</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">予約日</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">支払い状況</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userReservations.map(
                ({ event, stage, ticketType, reservation }) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <Typography variant="body2">{event.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {toJST(stage.start_time, "dateTime")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticketType.type_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {toJST(reservation.created_at, "dateTime")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={
                          reservation.is_paid ? "success.main" : "error.main"
                        }
                      >
                        {reservation.is_paid ? "受付済" : "受付前"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ManageUserReservations;
