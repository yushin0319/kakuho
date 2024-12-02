// app/src/pages/Booking.tsx
import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CalendarView from "../components/CalendarView";
import LoadingScreen from "../components/LoadingScreen";
import { useEventData } from "../context/EventDataContext";
import { EventResponse } from "../services/interfaces";
import { toJST, toJSTDate } from "../services/utils";

const Booking = () => {
  const { events, stages, loading, error } = useEventData();
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null
  );
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

          if (stageStartDate < start_date) start_date = stageStartDate;
          if (stageStartDate > end_date) end_date = stageStartDate;
        }
      });

      newStartDates[event.id] = start_date;
      newEndDates[event.id] = end_date;
    });

    setStartDate(newStartDates);
    setEndDate(newEndDates);
  }, [events, stages]);

  if (loading) return <LoadingScreen />;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <Container>
      {selectedEvent === null ? (
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            イベントをお選びください
          </Typography>
          {events.map((event) => (
            <Card
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              sx={{
                my: 2,
                p: 2,
                cursor: "pointer",
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {event.name}
                </Typography>
                <Typography variant="body2" color="secondary">
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
        </Box>
      ) : (
        <CalendarView
          event={selectedEvent}
          onBack={() => setSelectedEvent(null)}
        />
      )}
    </Container>
  );
};

export default Booking;
