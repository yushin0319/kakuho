// app/src/components/EventList.tsx
import React from "react";
import useEventData from "../hooks/useEventData";

interface EventListProps {
  onSelectEvent: (id: number) => void;
}

const EventList: React.FC<EventListProps> = ({ onSelectEvent }) => {
  const { events, isLoading, error } = useEventData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
