// app/src/pages/ManageList.tsx
import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import ManageListEvent from "../components/ManageListEvent";
import { useAppData } from "../context/AppData";

const ManageList = () => {
  const { events, stages, loading, error } = useAppData();
  const [startDate, setStartDate] = useState<Record<number, Date>>({});
  const [openEventIds, setOpenEventIds] = useState<number[]>([]);

  // イベントの開始日を取得
  useEffect(() => {
    const newStartDates: Record<number, Date> = {};

    events.forEach((event) => {
      let start_date = new Date(3000, 1, 1);

      stages.forEach((stage) => {
        if (stage.event_id === event.id) {
          const stageStartDate = new Date(stage.start_time);

          if (stageStartDate < start_date) start_date = stageStartDate;
        }
      });

      newStartDates[event.id] = start_date;
    });

    setStartDate(newStartDates);
  }, [loading]);

  // イベントの展開状態を切り替える
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
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        開催中のイベント
      </Typography>
      {events
        .filter((event) => startDate[event.id] > new Date())
        .map((event) => (
          <ManageListEvent
            key={event.id}
            event={event}
            isOpen={openEventIds.includes(event.id)}
            toggle={() => toggleEvent(event.id)}
          />
        ))}
      <Typography variant="body2" color="textSecondary" sx={{ mt: 4, mb: 2 }}>
        過去のイベント
      </Typography>
      {events
        .filter((event) => startDate[event.id] <= new Date())
        .map((event) => (
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
