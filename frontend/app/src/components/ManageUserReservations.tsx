import { useEffect, useState } from "react";
import {
  ReservationDetail,
  useReservationContext,
} from "../context/ReservationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { toJST } from "../services/utils";
import "../assets/styles/ManageUserReservations.scss";

type ManageUserReservationsProps = {
  userId: number;
};

const ManageUserReservations = ({ userId }: ManageUserReservationsProps) => {
  const [data, setData] = useState<ReservationDetail[]>([]);
  const { reservations } = useReservationContext();
  const [isLoading, setIsLoading] = useState(true);

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
            <TableCell>イベント</TableCell>
            <TableCell>ステージ</TableCell>
            <TableCell>チケット</TableCell>
            <TableCell>予約日</TableCell>
            <TableCell>支払い状況</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((res) => (
            <TableRow key={res.reservation.id}>
              <TableCell>{res.event.name}</TableCell>
              <TableCell>{toJST(res.stage.start_time, "dateTime")}</TableCell>
              <TableCell>{res.ticketType.type_name}</TableCell>
              <TableCell>
                {toJST(res.reservation.created_at, "dateTime")}
              </TableCell>
              <TableCell>
                {res.reservation.is_paid ? "支払い済" : "未払い"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ManageUserReservations;
