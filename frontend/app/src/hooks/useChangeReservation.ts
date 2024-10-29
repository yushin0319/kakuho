// app/src/hooks/useChangeReservation.ts
import { useState } from "react";
import { updateReservation } from "../services/api/reservation";
import { ReservationUpdate, ReservationResponse } from "../services/interfaces";

export const useChangeReservation = () => {
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  const changeReservation = async (
    id: number,
    data: ReservationUpdate
  ): Promise<ReservationResponse | null> => {
    try {
      setIsChanging(true);
      const updatedReservation = await updateReservation(id, data);
      return updatedReservation;
    } catch (error) {
      setChangeError("Failed to change the reservation.");
      console.error(error);
      return null;
    } finally {
      setIsChanging(false);
    }
  };

  return { changeReservation, isChanging, changeError };
};
