// app/src/pages/ReservationList.tsx
import { useEffect, useState } from "react";
import { Container } from "@mui/material";
import ReservationCard from "../components/ReservationCard";
import { useReservationContext } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";

const ReservationList = () => {
  const { reservations, isLoading, error } = useReservationContext();
  const [expandCardId, setExpandCardId] = useState<number | null>(null);
  const { newItems, clearNewItems } = useNewItemContext();

  useEffect(() => {
    if (newItems.length > 0) {
      setTimeout(() => {
        clearNewItems();
      }, 0);
    }
  }, [reservations]);

  const handleCardClick = (id: number) => {
    setExpandCardId((prev: number | null) => (prev === id ? null : id));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container fixed>
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
