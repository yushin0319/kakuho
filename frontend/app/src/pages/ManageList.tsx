// app/src/pages/ManageList.tsx
import { useEffect, useState } from "react";
import { fetchEvents } from "../services/api/event";
import { EventResponse } from "../services/interfaces";
import ManageListEvent from "../components/ManageListEvent";
import "../assets/styles/ManageList.scss";

const ManageList = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [openEventIds, setOpenEventIds] = useState<number[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };

    loadEvents();
  }, []);

  const toggleEvent = (id: number) => {
    if (openEventIds.includes(id)) {
      setOpenEventIds(openEventIds.filter((eventId) => eventId !== id));
    } else {
      setOpenEventIds([...openEventIds, id]);
    }
  };

  return (
    <div>
      {events.map((event) => (
        <ManageListEvent
          key={event.id}
          event={event}
          isOpen={openEventIds.includes(event.id)}
          toggle={() => toggleEvent(event.id)}
        />
      ))}
    </div>
  );
};

export default ManageList;
