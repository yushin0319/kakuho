// app/src/components/ManageUserReservations.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  ReservationDetail,
  useReservationContext,
} from "../context/ReservationContext";
import { toJST } from "../services/utils";

type ManageUserReservationsProps = {
  userId: number;
};

const ManageUserReservations = ({ userId }: ManageUserReservationsProps) => {
  const [data, setData] = useState<ReservationDetail[]>([]);
  const { reservations } = useReservationContext();
  const [isLoading, setIsLoading] = useState(true);

  // ユーザーの予約データを取得
  useEffect(() => {
    setIsLoading(true);
    const data = reservations.filter((res) => res.user.id === userId);
    setData(data);
    setIsLoading(false);
  }, [reservations, userId]);

  if (isLoading) {
    return <div>データを読み込んでいます...</div>;
  }

  if (data.length === 0) {
    return <div>予約データがありません</div>;
  }

  return (
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
          {data.map((res) => (
            <TableRow key={res.reservation.id}>
              <TableCell>
                <Typography variant="body2">{res.event.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {toJST(res.stage.start_time, "dateTime")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {res.ticketType.type_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {toJST(res.reservation.created_at, "dateTime")}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {res.reservation.is_paid ? "支払い済" : "未払い"}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ManageUserReservations;
