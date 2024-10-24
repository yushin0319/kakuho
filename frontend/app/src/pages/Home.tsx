import { useState } from "react";
import EventList from "../components/EventList";
import CalendarView from "../components/CalendarView";

const Home = () => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const handleSelectEvent = (id: number) => {
    setSelectedEventId(id);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  return (
    <>
      {selectedEventId === null ? (
        <EventList onSelectEvent={handleSelectEvent} />
      ) : (
        <CalendarView eventId={selectedEventId} onBack={handleBack} />
      )}
    </>
  );
};

export default Home;
