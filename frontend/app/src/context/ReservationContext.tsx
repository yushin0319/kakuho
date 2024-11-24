// app/src/context/ReservationContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  fetchUserReservations,
  fetchReservations,
} from "../services/api/reservation";
import { fetchEvent, fetchEvents } from "../services/api/event";
import { fetchStage, fetchEventStages } from "../services/api/stage";
import {
  fetchSeatGroup,
  fetchStageSeatGroups,
} from "../services/api/seatGroup";
import {
  fetchTicketType,
  fetchSeatGroupTicketTypes,
} from "../services/api/ticketType";
import { fetchUser, fetchUsers } from "../services/api/user";
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
  simpleReload: () => void;
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

      const users = await fetchUsers();
      users.forEach((user) => cache.users.set(user.id, user));

      // 2. イベントを一括取得
      const events = await fetchEvents();
      events.forEach((event) => cache.events.set(event.id, event));

      // 3. イベントごとのステージを取得
      const stagePromises = Array.from(cache.events.values()).map((event) =>
        fetchEventStages(event.id)
      );
      const stagesArray = await Promise.all(stagePromises);
      const stages = stagesArray.flat();
      stages.forEach((stage) => cache.stages.set(stage.id, stage));

      // 4. ステージごとのシートグループを取得
      const seatGroupPromises = Array.from(cache.stages.values()).map((stage) =>
        fetchStageSeatGroups(stage.id)
      );
      const seatGroupsArray = await Promise.all(seatGroupPromises);
      const seatGroups = seatGroupsArray.flat();
      seatGroups.forEach((seatGroup) =>
        cache.seatGroups.set(seatGroup.id, seatGroup)
      );

      // 5. シートグループごとのチケットタイプを取得
      const ticketTypePromises = Array.from(cache.seatGroups.values()).map(
        (seatGroup) => fetchSeatGroupTicketTypes(seatGroup.id)
      );
      const ticketTypesArray = await Promise.all(ticketTypePromises);
      const ticketTypes = ticketTypesArray.flat();
      ticketTypes.forEach((ticketType) =>
        cache.ticketTypes.set(ticketType.id, ticketType)
      );

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

  const simpleReload = () => {
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
