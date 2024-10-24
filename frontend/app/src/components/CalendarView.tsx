import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ja } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomToolbar from "./CustomToolbar";
import "../assets/styles/CalendarView.scss";
import { fetchEventTime } from "../services/api/event";
import { fetchEventStages } from "../services/api/stage";
import { StageResponse, EventTimeResponse } from "../services/interfaces";
import TicketPopup from "./TicketPopup";

const locales = { ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarViewProps {
  eventId: number;
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ eventId, onBack }) => {
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchAndSetEventTime = async () => {
      try {
        // イベントの開始時刻を取得
        const eventTime: EventTimeResponse = await fetchEventTime(eventId);
        if (eventTime.start_time) {
          const startDate = new Date(eventTime.start_time);
          setDefaultDate(
            new Date(startDate.getFullYear(), startDate.getMonth(), 1)
          );
        } else {
          console.error("Invalid start_time in eventTime:", eventTime);
        }
        // ステージを取得
        const fetchedStages = await fetchEventStages(eventId);
        setStages(fetchedStages);
      } catch (error) {
        console.error("Failed to fetch event time or stages:", error);
      }
    };

    fetchAndSetEventTime();
  }, [eventId]);

  if (!defaultDate) {
    return <div>Loading...</div>;
  }

  // カレンダーに表示するイベントデータの作成
  const calendarEvents = stages.map((stage) => ({
    id: stage.id,
    title: new Date(stage.start_time).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    start: new Date(stage.start_time),
    end: new Date(stage.end_time),
    allDay: false,
  }));

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
      <Calendar
        localizer={localizer}
        events={calendarEvents}
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
            <span onClick={() => handleStageClick(event.id)}>
              {event.title}
            </span>
          ),
          toolbar: CustomToolbar,
        }}
      />
      {isPopupOpen && selectedStageId && (
        <TicketPopup
          stageId={selectedStageId}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;
