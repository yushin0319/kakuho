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

export interface ReservationDetail {
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

// キャッシュオブジェクト
const cache = {
  events: new Map<number, EventResponse>(),
  stages: new Map<number, StageResponse>(),
  seatGroups: new Map<number, SeatGroupResponse>(),
  ticketTypes: new Map<number, TicketTypeResponse>(),
  users: new Map<number, UserResponse>(),
};

// キャッシュクリア関数
const clearCache = () => {
  cache.events.clear();
  cache.stages.clear();
  cache.seatGroups.clear();
  cache.ticketTypes.clear();
  cache.users.clear();
};

export const ReservationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // キャッシュ付きフェッチ関数
  const fetchWithCache = async <T,>(
    id: number,
    cacheMap: Map<number, T>,
    fetchFunction: (id: number) => Promise<T>
  ): Promise<T> => {
    if (cacheMap.has(id)) {
      return cacheMap.get(id)!;
    }
    const data = await fetchFunction(id);
    cacheMap.set(id, data);
    return data;
  };

  const loadReservations = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const reservations: ReservationResponse[] = user.is_admin
        ? await fetchReservations()
        : await fetchUserReservations(user.id);

      const reservationDetails = [];
      for (const reservation of reservations) {
        const ticketType = await fetchWithCache(
          reservation.ticket_type_id,
          cache.ticketTypes,
          fetchTicketType
        );
        const seatGroup = await fetchWithCache(
          ticketType.seat_group_id,
          cache.seatGroups,
          fetchSeatGroup
        );
        const stage = await fetchWithCache(
          seatGroup.stage_id,
          cache.stages,
          fetchStage
        );
        const event = await fetchWithCache(
          stage.event_id,
          cache.events,
          fetchEvent
        );
        const user = await fetchWithCache(
          reservation.user_id,
          cache.users,
          fetchUser
        );
        reservationDetails.push({
          reservation,
          event,
          stage,
          seatGroup,
          ticketType,
          user,
        });
      }
      setReservations(reservationDetails);
    } catch (error) {
      setError("Failed to load reservations.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // `reloadReservations` が呼ばれるとキャッシュをクリア
  const reloadReservations = () => {
    clearCache();
    loadReservations();
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
        reloadReservations,
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
