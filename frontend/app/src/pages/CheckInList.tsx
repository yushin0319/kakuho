// app/src/pages/ManageList.tsx
import { Container, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CheckInEvent from "../components/CheckInEvent";
import LoadingScreen from "../components/LoadingScreen";
import { useAppData } from "../context/AppData";

const CheckInList = () => {
  const { events, eventStartDates, loading, error } = useAppData();
  const [openEventIds, setOpenEventIds] = useState<number[]>([]);

  // イベントの展開状態を切り替える
  const toggleEvent = (id: number) => {
    if (openEventIds.includes(id)) {
      setOpenEventIds(openEventIds.filter((eventId) => eventId !== id));
    } else {
      setOpenEventIds([...openEventIds, id]);
    }
  };

  const futureEvents = useMemo(
    () => events.filter((event) => eventStartDates[event.id] > new Date()),
    [events, eventStartDates]
  );

  const pastEvents = useMemo(
    () => events.filter((event) => eventStartDates[event.id] <= new Date()),
    [events, eventStartDates]
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      {loading && <LoadingScreen />}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        開催中のイベント
      </Typography>
      {futureEvents.map((event) => (
        <CheckInEvent
          key={event.id}
          event={event}
          isOpen={openEventIds.includes(event.id)}
          toggle={() => toggleEvent(event.id)}
        />
      ))}
      <Typography variant="body2" color="textSecondary" sx={{ mt: 4, mb: 2 }}>
        過去のイベント
      </Typography>
      {pastEvents.map((event) => (
        <CheckInEvent
          key={event.id}
          event={event}
          isOpen={openEventIds.includes(event.id)}
          toggle={() => toggleEvent(event.id)}
        />
      ))}
    </Container>
  );
};

export default CheckInList;
