// app/src/pages/Booking.tsx
import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { useState } from "react";
import Calendar from "../components/Calendar";
import LoadingScreen from "../components/LoadingScreen";
import { useAppData } from "../context/AppData";
import { EventResponse } from "../services/interfaces";
import { toJST } from "../services/utils";

const Booking = () => {
  const { events, eventStartDates, eventEndDates, loading, error } =
    useAppData();
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null
  );

  if (error) return <div>エラーが発生しました</div>;

  return (
    <Container>
      {loading && <LoadingScreen />}
      {selectedEvent === null ? (
        <Box>
          <Typography variant="caption" color="textSecondary">
            ご予約するイベントをお選びください
          </Typography>
          {/* 終了日前のイベントのみ表示　*/}

          {events
            .filter((event) => eventEndDates[event.id] > new Date())
            .map((event) => (
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
                    {eventStartDates[event.id] && eventEndDates[event.id]
                      ? `${toJST(
                          eventStartDates[event.id],
                          "fullDate"
                        )} - ${toJST(eventEndDates[event.id], "fullDate")}`
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
        <Calendar event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      )}
    </Container>
  );
};

export default Booking;
