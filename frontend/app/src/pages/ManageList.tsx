// app/src/pages/ManageList.tsx
import { Container } from "@mui/material";
import { useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ManageListEvent from "../components/ManageListEvent";
import { useEventData } from "../context/EventDataContext";

const ManageList = () => {
  const { events, loading, error } = useEventData();
  const [openEventIds, setOpenEventIds] = useState<number[]>([]);

  const toggleEvent = (id: number) => {
    if (openEventIds.includes(id)) {
      setOpenEventIds(openEventIds.filter((eventId) => eventId !== id));
    } else {
      setOpenEventIds([...openEventIds, id]);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      {loading && <LoadingScreen />}
      {events.map((event) => (
        <ManageListEvent
          key={event.id}
          event={event}
          isOpen={openEventIds.includes(event.id)}
          toggle={() => toggleEvent(event.id)}
        />
      ))}
    </Container>
  );
};

export default ManageList;
