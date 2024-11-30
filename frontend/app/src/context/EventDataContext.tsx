import React, { createContext, useContext, useState, useEffect } from "react";
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
import {
  EventResponse,
  StageResponse,
  SeatGroupResponse,
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
        const eventsData = await fetchEvents();
        setEvents(eventsData);

        const stagesData = (
          await Promise.all(
            eventsData.map((event) => fetchEventStages(event.id))
          )
        ).flat();
        setStages(stagesData);

        const seatGroupsData = (
          await Promise.all(
            stagesData.map((stage) => fetchStageSeatGroups(stage.id))
          )
        ).flat();
        setSeatGroups(seatGroupsData);

        const ticketTypesData = (
          await Promise.all(
            seatGroupsData.map((sg) => fetchSeatGroupTicketTypes(sg.id))
          )
        ).flat();
        setTicketTypes(ticketTypesData);

        const ticketTypeMap = Object.fromEntries(
          await Promise.all(
            seatGroupsData.map(async (sg) => [
              sg.id,
              (
                await fetchSeatGroupTicketTypes(sg.id)
              ).map((tt) => tt.type_name),
            ])
          )
        );

        setSeatGroupNames(ticketTypeMap);
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
