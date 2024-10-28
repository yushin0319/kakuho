// app/src/pages/Home.tsx
import { useState } from "react";
import EventList from "../components/EventList";
import CalendarView from "../components/CalendarView";
import { EventResponse } from "../services/interfaces"; // イベントの型インポート

const Home = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null
  ); // イベント全体をステートで管理

  const handleSelectEvent = (event: EventResponse) => {
    setSelectedEvent(event);
  };

  const handleBack = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      {selectedEvent === null ? (
        <EventList onSelectEvent={handleSelectEvent} />
      ) : (
        <CalendarView event={selectedEvent} onBack={handleBack} />
      )}
    </>
  );
};

export default Home;
