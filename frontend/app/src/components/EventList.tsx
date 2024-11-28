// app/src/components/EventList.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  LinearProgress,
} from "@mui/material";
import { EventResponse } from "../services/interfaces";
import { useEventData } from "../context/EventDataContext";
import { toJST, toJSTDate } from "../services/utils";

interface EventListProps {
  onSelectEvent: (event: EventResponse) => void;
}

const EventList = ({ onSelectEvent }: EventListProps) => {
  const { events, stages, loading, error } = useEventData();
  const [startDate, setStartDate] = useState<Record<number, Date>>({});
  const [endDate, setEndDate] = useState<Record<number, Date>>({});

  // イベントの開始日と終了日を取得
  useEffect(() => {
    const newStartDates: Record<number, Date> = {};
    const newEndDates: Record<number, Date> = {};

    events.forEach((event) => {
      let start_date = new Date(3000, 1, 1);
      let end_date = new Date(1000, 1, 1);

      stages.forEach((stage) => {
        if (stage.event_id === event.id) {
          const stageStartDate = toJSTDate(stage.start_time);
          const stageEndDate = toJSTDate(stage.end_time);

          if (stageStartDate < start_date) start_date = stageStartDate;
          if (stageEndDate > end_date) end_date = stageEndDate;
        }
      });

      newStartDates[event.id] = start_date;
      newEndDates[event.id] = end_date;
    });

    setStartDate(newStartDates);
    setEndDate(newEndDates);
  }, [events, stages]);

  if (loading) return <LinearProgress />;
  if (error) return <div>error</div>;

  return (
    <Container fixed>
      <Typography variant="h6" sx={{ mb: 4 }}>
        イベントを選択してください
      </Typography>
      {events.map((event) => (
        <Card
          key={event.id}
          onClick={() => onSelectEvent(event)}
          sx={{
            my: 4,
            p: 2,
            cursor: "pointer",
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {event.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {startDate[event.id] && endDate[event.id]
                ? `${toJST(startDate[event.id], "fullDate")} - ${toJST(
                    endDate[event.id],
                    "fullDate"
                  )}`
                : ""}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {event.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default EventList;
