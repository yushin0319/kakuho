import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchEvent, fetchEvents } from "../services/api/event";
import { fetchSeatGroup, fetchSeatGroups } from "../services/api/seatGroup";
import { fetchStage, fetchStages } from "../services/api/stage";
import { fetchTicketType, fetchTicketTypes } from "../services/api/ticketType";
import {
  EventResponse,
  SeatGroupResponse,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";

interface EventDataContextType {
  events: EventResponse[];
  stages: StageResponse[];
  seatGroups: SeatGroupResponse[];
  seatGroupNames: Record<number, string[]>;
  ticketTypes: TicketTypeResponse[];
  changeEvent: (id: number) => void;
  changeStage: (id: number) => void;
  changeSeatGroup: (id: number) => void;
  changeTicketType: (id: number) => void;
  loading: boolean;
  error: string | null;
}

const EventDataContext = createContext<EventDataContextType | null>(null);

export const EventDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [seatGroups, setSeatGroups] = useState<SeatGroupResponse[]>([]);
  const [seatGroupNames, setSeatGroupNames] = useState<
    Record<number, string[]>
  >({});
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingTask, setLoadingTask] = useState(0);

  const addTask = () => {
    setLoadingTask((prev) => prev + 1);
  };
  const removeTask = () => {
    setLoadingTask((prev) => prev - 1);
  };

  const loading = loadingTask > 0;

  useEffect(() => {
    const loadData = async () => {
      addTask();
      setError(null);
      try {
        const [eventsData, stagesData, seatGroupsData, ticketTypesData] =
          await Promise.all([
            fetchEvents(),
            fetchStages(),
            fetchSeatGroups(),
            fetchTicketTypes(),
          ]);

        setEvents(eventsData);
        setStages(stagesData);
        setSeatGroups(seatGroupsData);
        setTicketTypes(ticketTypesData);

        const nameMap = Object.fromEntries(
          seatGroupsData.map((sg) => [
            sg.id,
            ticketTypesData
              .filter((tt) => tt.seat_group_id === sg.id)
              .map((tt) => tt.type_name),
          ])
        );
        setSeatGroupNames(nameMap);
      } catch (e) {
        setError("データの取得に失敗しました");
      } finally {
        removeTask();
      }
    };
    loadData();
  }, []);

  const changeEvent = async (id: number) => {
    addTask();
    setError(null);
    try {
      const updated = await fetchEvent(id);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch (e) {
      setError("データの更新に失敗しました");
    } finally {
      removeTask();
    }
  };

  const changeStage = async (id: number) => {
    addTask();
    setError(null);
    try {
      const updated = await fetchStage(id);
      setStages((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (e) {
      setError("データの更新に失敗しました");
    } finally {
      removeTask();
    }
  };

  const changeSeatGroup = async (id: number) => {
    addTask();
    setError(null);
    try {
      const updated = await fetchSeatGroup(id);
      setSeatGroups((prev) => prev.map((sg) => (sg.id === id ? updated : sg)));
    } catch (e) {
      setError("データの更新に失敗しました");
    } finally {
      removeTask();
    }
  };

  const changeTicketType = async (id: number) => {
    addTask();
    setError(null);
    try {
      const updated = await fetchTicketType(id);
      setTicketTypes((prev) => prev.map((tt) => (tt.id === id ? updated : tt)));
    } catch (e) {
      setError("データの更新に失敗しました");
    } finally {
      removeTask();
    }
  };

  return (
    <EventDataContext.Provider
      value={{
        events,
        stages,
        seatGroups,
        seatGroupNames,
        ticketTypes,
        changeEvent,
        changeStage,
        changeSeatGroup,
        changeTicketType,
        loading,
        error,
      }}
    >
      {children}
    </EventDataContext.Provider>
  );
};

export const useEventData = (): EventDataContextType => {
  const context = useContext(EventDataContext);
  if (!context) {
    throw new Error("useEventData must be used within an EventDataProvider");
  }
  return context;
};
