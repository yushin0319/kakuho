// app/src/pages/ReservationList.tsx
import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ReservationCard from "../components/ReservationCard";
import { useAppData } from "../context/AppData";
import { useNewItemContext } from "../context/NewItemContext";

const ReservationList = () => {
  const { reservations, loading, error } = useAppData();
  const [expandCardId, setExpandCardId] = useState<number | null>(null);
  const { newItems, clearNewItems } = useNewItemContext();

  // 新規予約がある場合、新規予約の表示を消す
  useEffect(() => {
    if (newItems.length > 0) {
      setTimeout(() => {
        clearNewItems();
      }, 0);
    }
  }, [reservations]);

  // カードクリック時の処理
  const handleCardClick = (id: number) => {
    setExpandCardId((prev) => (prev === id ? null : id));
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
      {loading && <LoadingScreen />}
      {reservations.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          予約がありません
        </Typography>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          クリックするとQRコードが表示されます
        </Typography>
      )}
      {reservations
        .sort(
          (a, b) =>
            new Date(a.stage.start_time).getTime() -
            new Date(b.stage.start_time).getTime()
        )
        .filter(
          (item) =>
            new Date(item.stage.start_time).getTime() >= new Date().getTime()
        )
        .map((item) => (
          <ReservationCard
            key={item.reservation.id}
            reservationDetail={item}
            isExpanded={expandCardId === item.reservation.id}
            isNew={newItems.includes(item.reservation.id)}
            onCardClick={() => handleCardClick(item.reservation.id)}
          />
        ))}
      {reservations.filter(
        (item) =>
          new Date(item.stage.start_time).getTime() < new Date().getTime()
      ).length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          過去のイベント
        </Typography>
      )}

      {reservations
        .sort(
          (a, b) =>
            new Date(b.stage.start_time).getTime() -
            new Date(a.stage.start_time).getTime()
        )
        .filter(
          (item) =>
            new Date(item.stage.start_time).getTime() < new Date().getTime()
        )
        .map((item) => (
          <ReservationCard
            key={item.reservation.id}
            reservationDetail={item}
            isExpanded={expandCardId === item.reservation.id}
            isNew={newItems.includes(item.reservation.id)}
            onCardClick={() => handleCardClick(item.reservation.id)}
          />
        ))}
    </Container>
  );
};

export default ReservationList;
