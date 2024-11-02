// app/src/pages/ReservationList.tsx
import { useEffect, useState } from "react";
import ReservationCard from "../components/ReservationCard";
import { useReservationContext } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";
import "../assets/styles/ReservationList.scss";

const ReservationList = () => {
  const { reservations, isLoading, error } = useReservationContext();
  const [expandCardId, setExpandCardId] = useState<number | null>(null);
  const { newItems, clearNewItems } = useNewItemContext();

  useEffect(() => {
    if (newItems.length > 0) {
      setTimeout(() => {
        console.log(reservations);
        console.log("clearNewItems=", newItems);
        clearNewItems();
      }, 300);
    }
  }, [reservations]);

  const handleCardClick = (id: number) => {
    setExpandCardId((prev: number | null) => (prev === id ? null : id));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="reservation-list">
      {reservations.map((item) => (
        <ReservationCard
          key={item.reservation.id}
          reservation={item.reservation}
          event={item.event}
          stage={item.stage}
          ticketType={item.ticketType}
          isExpanded={expandCardId === item.reservation.id}
          isNew={newItems.includes(item.reservation.id)}
          onCardClick={() => handleCardClick(item.reservation.id)}
        />
      ))}
    </div>
  );
};

export default ReservationList;
