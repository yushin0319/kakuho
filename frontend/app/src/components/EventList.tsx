// app/src/components/EventList.tsx
import useEventData from "../hooks/useEventData";
import { EventResponse } from "../services/interfaces";
import "../assets/styles/EventList.scss";

interface EventListProps {
  onSelectEvent: (event: EventResponse) => void;
}

const EventList = ({ onSelectEvent }: EventListProps) => {
  const { events, isLoading, error } = useEventData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="event-list-container">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onSelectEvent(event)}
          className="event-item"
        >
          <h2 className="event-title">{event.name}</h2>
          <p className="event-description">{event.description}</p>
          <p className="event-dates">
            {new Date(event.start_time).toLocaleDateString()} -{" "}
            {new Date(event.end_time).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default EventList;
