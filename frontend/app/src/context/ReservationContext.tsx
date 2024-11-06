// app/src/context/ReservationContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  fetchUserReservations,
  fetchReservations,
} from "../services/api/reservation";
import { fetchEvent } from "../services/api/event";
import { fetchStage } from "../services/api/stage";
import { fetchSeatGroup } from "../services/api/seatGroup";
import { fetchTicketType } from "../services/api/ticketType";
import { fetchUser } from "../services/api/user";
import {
  ReservationResponse,
  TicketTypeResponse,
  StageResponse,
  SeatGroupResponse,
  EventResponse,
  UserResponse,
} from "../services/interfaces";
import { useAuth } from "../context/AuthContext";

interface ReservationDetail {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  seatGroup: SeatGroupResponse;
  ticketType: TicketTypeResponse;
  user: UserResponse;
}

interface ReservationContextType {
  reservations: ReservationDetail[];
  isLoading: boolean;
  error: string | null;
  reloadReservations: () => void;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export const ReservationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const reservations: ReservationResponse[] = user.is_admin
        ? await fetchReservations()
        : await fetchUserReservations(user.id);
      const reservationDetails = await Promise.all(
        reservations.map(async (reservation) => {
          const ticketType: TicketTypeResponse = await fetchTicketType(
            reservation.ticket_type_id
          );
          const seatGroup: SeatGroupResponse = await fetchSeatGroup(
            ticketType.seat_group_id
          );
          const stage: StageResponse = await fetchStage(seatGroup.stage_id);
          const event: EventResponse = await fetchEvent(stage.event_id);
          const user: UserResponse = await fetchUser(reservation.user_id);
          return { reservation, event, stage, seatGroup, ticketType, user };
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

  useEffect(() => {
    loadReservations();
  }, [user]);

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        isLoading,
        error,
        reloadReservations: loadReservations,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservationContext = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error(
      "useReservationContext must be used within a ReservationProvider"
    );
  }
  return context;
};
