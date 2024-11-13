import { useEffect, useState } from "react";
import {
  ReservationDetail,
  useReservationContext,
} from "../context/ReservationContext";
import { getDate, getHour } from "../services/utils";
import "../assets/styles/ManageUserReservations.scss";

const ManageUserReservations = ({ userId }: { userId: number }) => {
  const [data, setData] = useState<ReservationDetail[]>([]);
  const { reservations } = useReservationContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 過去の予約データを取得する例
    const data = reservations.filter((res) => res.user.id === userId);
    setData(data);
    setIsLoading(false);
  }, [userId]);

  if (isLoading) {
    return <div>データを読み込んでいます...</div>;
  }

  return (
    <div className="user-reservations">
      <h2>予約一覧</h2>
      <ul>
        {data.map((res) => (
          <li key={res.reservation.id} className="reservation-item">
            <p>予約ID: {res.reservation.id}</p>
            <p>イベント: {res.event.name}</p>
            <p>
              ステージ: {getDate(new Date(res.stage.start_time))}{" "}
              {getHour(new Date(res.stage.start_time))}
            </p>
            <p>チケット: {res.ticketType.type_name}</p>
            <p>予約日: {getDate(new Date(res.reservation.created_at))}</p>
            <p>支払い状況: {res.reservation.is_paid ? "支払い済" : "未払い"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUserReservations;
