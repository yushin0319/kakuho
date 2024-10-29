// app/src/hooks/useReservationDetails.ts
import { useState, useEffect } from "react";
import { fetchUserReservations } from "../services/api/reservation";
import { fetchEvent } from "../services/api/event";
import { fetchStage } from "../services/api/stage";
import { fetchTicketType } from "../services/api/ticketType";
import {
  ReservationResponse,
  TicketTypeResponse,
  StageResponse,
  EventResponse,
} from "../services/interfaces";
import { useAuth } from "../context/AuthContext";

interface ReservationDetail {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  ticketType: TicketTypeResponse;
}

export const useReservationDetails = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReservations = async () => {
      if (!user) return;
      try {
        const reservations: ReservationResponse[] = await fetchUserReservations(
          user.id
        );
        const reservationDetails = await Promise.all(
          reservations.map(async (reservation) => {
            const ticketType: TicketTypeResponse = await fetchTicketType(
              reservation.ticket_type_id
            );
            const stage: StageResponse = await fetchStage(ticketType.stage_id);
            const event: EventResponse = await fetchEvent(stage.event_id);
            return { reservation, event, stage, ticketType };
          })
        );
        setReservations(reservationDetails);
      } catch (error) {
        setError("Failed to load reservations.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReservations();
  }, [user]);

  return { reservations, isLoading, error };
};

export default useReservationDetails;
