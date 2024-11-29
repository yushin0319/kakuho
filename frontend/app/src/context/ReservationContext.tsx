// app/src/context/ReservationContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  fetchUserReservations,
  fetchReservations,
} from "../services/api/reservation";

import { fetchUsers } from "../services/api/user";
import {
  ReservationResponse,
  TicketTypeResponse,
  StageResponse,
  SeatGroupResponse,
  EventResponse,
  UserResponse,
} from "../services/interfaces";
import { useAuth } from "../context/AuthContext";
import { useEventData } from "./EventDataContext";

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
  simpleReload: () => void;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

// キャッシュオブジェクト

const cache = {
  users: new Map<number, UserResponse>(),
};

// キャッシュクリア関数
const clearCache = () => {
  cache.users.clear();
};

export const ReservationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const {
    events,
    stages,
    seatGroups,
    ticketTypes,
    loading: eventLoading,
  } = useEventData();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    if (!user || eventLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const reservations: ReservationResponse[] = user.is_admin
        ? await fetchReservations()
        : await fetchUserReservations(user.id);

      if (user.is_admin) {
        const users = await fetchUsers();
        users.forEach((user) => cache.users.set(user.id, user));
      } else {
        cache.users.set(user.id, user);
      }

      const ticketTypeMap = new Map(ticketTypes.map((t) => [t.id, t]));
      const seatGroupMap = new Map(seatGroups.map((sg) => [sg.id, sg]));
      const stageMap = new Map(stages.map((s) => [s.id, s]));
      const eventMap = new Map(events.map((e) => [e.id, e]));

      const reservationDetails: ReservationDetail[] = reservations
        .map((res) => {
          const ticketType = ticketTypeMap.get(res.ticket_type_id);
          const seatGroup = ticketType
            ? seatGroupMap.get(ticketType.seat_group_id)
            : null;
          const stage = seatGroup?.stage_id
            ? stageMap.get(seatGroup.stage_id)
            : null;
          const event = stage?.event_id ? eventMap.get(stage.event_id) : null;
          const user = cache.users.get(res.user_id);
          if (!ticketType || !seatGroup || !stage || !event || !user) {
            throw new Error("Invalid data");
          }
          return {
            reservation: res,
            ticketType,
            seatGroup,
            stage,
            event,
            user,
          } as ReservationDetail;
        })
        .filter(Boolean);
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

  const simpleReload = () => {
    loadReservations();
  };

  useEffect(() => {
    loadReservations();
  }, [user, eventLoading]);

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        isLoading,
        error,
        reloadReservations,
        simpleReload,
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
