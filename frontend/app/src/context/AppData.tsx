// app/src/context/AppData.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";
import { fetchEvents } from "../services/api/event";
import {
  fetchReservations,
  fetchUserReservations,
} from "../services/api/reservation";
import { fetchSeatGroups } from "../services/api/seatGroup";
import { fetchStages } from "../services/api/stage";
import { fetchTicketTypes } from "../services/api/ticketType";
import { fetchUsers } from "../services/api/user";
import {
  EventResponse,
  ReservationResponse,
  SeatGroupResponse,
  StageResponse,
  TicketTypeResponse,
  UserResponse,
} from "../services/interfaces";

export interface ReservationDetail {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  seatGroup: SeatGroupResponse;
  ticketType: TicketTypeResponse;
  user: UserResponse;
}

interface AppDataContextType {
  events: EventResponse[];
  eventStartDates: Record<number, Date>;
  eventEndDates: Record<number, Date>;
  futureEvents: EventResponse[];
  pastEvents: EventResponse[];
  stages: StageResponse[];
  seatGroups: SeatGroupResponse[];
  seatGroupNames: Record<number, string[]>;
  ticketTypes: TicketTypeResponse[];
  users: UserResponse[];
  reservations: ReservationDetail[];
  loading: boolean;
  error: string | null;
  reloadData: () => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const AppDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [seatGroups, setSeatGroups] = useState<SeatGroupResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [eventStartDates, setEventStartDates] = useState<Record<number, Date>>(
    {}
  );
  const [eventEndDates, setEventEndDates] = useState<Record<number, Date>>({});
  const [seatGroupNames, setSeatGroupNames] = useState<
    Record<number, string[]>
  >({});
  const [tasks, setTasks] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const loading = tasks > 0;

  const loadData = async () => {
    if (!user) return; // ログインしていない場合はスキップ
    setError(null);

    try {
      setTasks((prev) => prev + 1);
      const [
        eventsData,
        stagesData,
        seatGroupsData,
        ticketTypesData,
        reservationsData,
        usersData,
      ] = await Promise.all([
        fetchEvents(),
        fetchStages(),
        fetchSeatGroups(),
        fetchTicketTypes(),
        user.is_admin ? fetchReservations() : fetchUserReservations(user.id),
        user.is_admin ? fetchUsers() : Promise.resolve([user]),
      ]);

      setEvents(eventsData);
      setStages(stagesData);
      setSeatGroups(seatGroupsData);
      setTicketTypes(ticketTypesData);
      setUsers(usersData);

      // EventStartDatesの生成
      const newStartDates: Record<number, Date> = {};
      const newEndDates: Record<number, Date> = {};
      eventsData.forEach((event) => {
        let start_date = new Date(3000, 1, 1);
        let end_date = new Date(1000, 1, 1);

        stagesData.forEach((stage) => {
          if (stage.event_id === event.id) {
            const stageStartDate = new Date(stage.start_time);
            const stageEndDate = new Date(stage.end_time);

            if (stageStartDate < start_date) start_date = stageStartDate;
            if (stageEndDate > end_date) end_date = stageEndDate;
          }
        });

        newStartDates[event.id] = start_date;
        newEndDates[event.id] = end_date;
      });
      setEventStartDates(newStartDates);
      setEventEndDates(newEndDates);

      // SeatGroupNamesの生成
      const nameMap = Object.fromEntries(
        seatGroupsData.map((sg) => [
          sg.id,
          ticketTypesData
            .filter((tt) => tt.seat_group_id === sg.id)
            .map((tt) => tt.type_name),
        ])
      );
      setSeatGroupNames(nameMap);

      // ReservationsDetailの構築
      const ticketTypeMap = new Map(ticketTypesData.map((t) => [t.id, t]));
      const seatGroupMap = new Map(seatGroupsData.map((sg) => [sg.id, sg]));
      const stageMap = new Map(stagesData.map((s) => [s.id, s]));
      const eventMap = new Map(eventsData.map((e) => [e.id, e]));
      const userMap = new Map(usersData.map((u) => [u.id, u]));

      const reservationDetails = reservationsData.map((res) => {
        const ticketType = ticketTypeMap.get(res.ticket_type_id);
        const seatGroup = ticketType
          ? seatGroupMap.get(ticketType.seat_group_id)
          : null;
        const stage = seatGroup?.stage_id
          ? stageMap.get(seatGroup.stage_id)
          : null;
        const event = stage?.event_id ? eventMap.get(stage.event_id) : null;
        const user = userMap.get(res.user_id);

        if (!ticketType || !seatGroup || !stage || !event || !user) {
          throw new Error("Invalid reservation data");
        }

        return {
          reservation: res,
          ticketType,
          seatGroup,
          stage,
          event,
          user,
        };
      });

      setReservations(reservationDetails);
    } catch (e) {
      setError("データの取得に失敗しました");
      console.error(e);
    } finally {
      setTasks((prev) => prev - 1);
    }
  };

  const reloadData = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const futureEvents = useMemo(
    () =>
      events
        .filter((event) => eventStartDates[event.id] > new Date())
        .sort(
          (a, b) =>
            new Date(eventStartDates[a.id]).getTime() -
            new Date(eventStartDates[b.id]).getTime()
        ),
    [events, eventStartDates]
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => eventStartDates[event.id] <= new Date())
        .sort(
          (a, b) =>
            new Date(eventStartDates[b.id]).getTime() -
            new Date(eventStartDates[a.id]).getTime()
        ),
    [events, eventStartDates]
  );

  return (
    <AppDataContext.Provider
      value={{
        events,
        eventStartDates,
        eventEndDates,
        futureEvents,
        pastEvents,
        stages,
        seatGroups,
        seatGroupNames,
        ticketTypes,
        users,
        reservations,
        loading,
        error,
        reloadData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};
