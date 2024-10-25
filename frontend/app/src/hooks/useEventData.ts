// app/src/hooks/useEventData.ts
import { useState, useEffect } from "react";
import { fetchEvents, fetchEventTime } from "../services/api/event";
import { EventResponse, EventTimeResponse } from "../services/interfaces";

const useEventData = () => {
  const [events, setEvents] = useState<(EventResponse & EventTimeResponse)[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        const eventList = await fetchEvents();
        const eventsWithTime = await Promise.all(
          eventList.map(async (event) => {
            const time = await fetchEventTime(event.id);
            return { ...event, ...time };
          })
        );
        setEvents(eventsWithTime);
      } catch (err) {
        setError("Failed to load events.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, []);

  return { events, isLoading, error };
};

export default useEventData;
