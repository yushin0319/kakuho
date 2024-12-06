// app/src/pages/ReservationList.tsx
import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ReservationCard from "../components/ReservationCard";
import { useNewItemContext } from "../context/NewItemContext";
import { useReservationContext } from "../context/ReservationContext";

const ReservationList = () => {
  const { reservations, isLoading, error } = useReservationContext();
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
      {isLoading && <LoadingScreen />}
      <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
        クリックするとQRコードが表示されます
      </Typography>
      {reservations.map((item) => (
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
