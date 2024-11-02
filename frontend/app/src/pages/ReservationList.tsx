// app/src/pages/ReservationList.tsx
import ReservationCard from "../components/ReservationCard";
import { useReservationContext } from "../context/ReservationContext";
import "../assets/styles/ReservationList.scss";
import { useState } from "react";

const ReservationList = () => {
  const { reservations, isLoading, error } = useReservationContext();
  const [expandCardId, setExpandCardId] = useState<number | null>(null);

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
          onCardClick={() => handleCardClick(item.reservation.id)}
        />
      ))}
    </div>
  );
};

export default ReservationList;
