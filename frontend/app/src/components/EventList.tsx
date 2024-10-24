import React, { useState, useEffect } from "react";
import { EventResponse, EventTimeResponse } from "../services/interfaces";
import { fetchEvents, fetchEventTime } from "../services/api/event";

interface EventListProps {
  onSelectEvent: (id: number) => void;
}

const EventList: React.FC<EventListProps> = ({ onSelectEvent }) => {
  const [events, setEvents] = useState<(EventResponse & EventTimeResponse)[]>(
    []
  );

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventList: EventResponse[] = await fetchEvents();
        const eventsWithTime = await Promise.all(
          eventList.map(async (event) => {
            const time: EventTimeResponse = await fetchEventTime(event.id);
            return { ...event, ...time };
          })
        );

        setEvents(eventsWithTime);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };

    loadEvents();
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onSelectEvent(event.id)}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            width: "300px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0" }}>{event.name}</h2>
          <p style={{ color: "#555" }}>{event.description}</p>
          <p style={{ color: "#888" }}>
            {new Date(event.start_time).toLocaleDateString()} -{" "}
            {new Date(event.end_time).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default EventList;
