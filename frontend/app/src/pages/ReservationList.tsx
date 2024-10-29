// app/src/pages/ReservationList.tsx
import React from "react";
import ReservationCard from "../components/ReservationCard";
import { useReservationDetails } from "../hooks/useReservationDetails";
import "../assets/styles/ReservationList.scss";

const ReservationList: React.FC = () => {
  const { reservations, isLoading, error } = useReservationDetails();

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
        />
      ))}
    </div>
  );
};

export default ReservationList;
