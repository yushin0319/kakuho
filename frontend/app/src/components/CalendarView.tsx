// app/src/components/CalendarView.tsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ja } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
  event: EventResponse; // event全体を受け取るように変更
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ event, onBack }) => {
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
      <h2 className="calendar-title">{event.name}</h2> {/* event.nameを表示 */}
      <Calendar
        localizer={localizer}
        events={stages.map((stage: StageResponse) => ({
          id: stage.id,
          title: new Date(stage.start_time).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          start: new Date(stage.start_time),
          end: new Date(stage.end_time),
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
          event={event} // event全体を渡す
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;
