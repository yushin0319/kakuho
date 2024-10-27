// useReservation.ts
import { useState } from "react";
import { createReservation } from "../services/api/reservation";
import { ReservationCreate, ReservationResponse } from "../services/interfaces";

export const useReservation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationResponse | null>(
    null
  );

  const makeReservation = async (
    ticket_type_id: number,
    reservationData: ReservationCreate
  ) => {
    try {
      setIsLoading(true);
      const response = await createReservation(ticket_type_id, reservationData);
      setReservation(response);
    } catch (err) {
      setError("Failed to create reservation.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { makeReservation, isLoading, error, reservation };
};
