// app/src/components/CalendarView.tsx
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ja } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { toJST, toJSTDate } from "../services/utils";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useCalendarData from "../hooks/useCalendarData";
import CustomToolbar from "./CustomToolbar";
import TicketPopup from "./TicketPopup";
import { StageResponse, EventResponse } from "../services/interfaces"; // イベントの型インポート
import "../assets/styles/CalendarView.scss";

const locales = { ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarViewProps {
  event: EventResponse;
  onBack: () => void;
}

const CalendarView = ({ event, onBack }: CalendarViewProps) => {
  const { stages, defaultDate, isLoading, error } = useCalendarData(event.id); // event.idを利用
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if (isLoading || !defaultDate) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleStageClick = (stageId: number) => {
    setSelectedStageId(stageId);
    setIsPopupOpen(true);
  };

  const formats = {
    monthHeaderFormat: "yyyy年M月",
    weekdayFormat: "E",
  };

  return (
    <div className="calendar-container">
      <button onClick={onBack}>イベントリストに戻る</button>
      <h2 className="calendar-title">{event.name}</h2>
      <Calendar
        localizer={localizer}
        events={stages.map((stage: StageResponse) => ({
          id: stage.id,
          title: toJST(stage.start_time, "time"),
          start: toJSTDate(stage.start_time),
          end: toJSTDate(stage.start_time),
          allDay: false,
        }))}
        defaultView="month"
        views={["month"]}
        defaultDate={defaultDate}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "600px", width: "500px" }}
        culture="ja"
        formats={formats}
        components={{
          event: ({ event }: { event: any }) => (
            <div
              onClick={() => handleStageClick(event.id)}
              className="calendar-event"
            >
              {event.title}
            </div>
          ),
          toolbar: CustomToolbar,
        }}
      />
      {isPopupOpen && selectedStageId && (
        <TicketPopup
          stageId={selectedStageId}
          event={event}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;
