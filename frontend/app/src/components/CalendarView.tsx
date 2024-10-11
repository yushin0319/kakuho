import React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ja } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomToolbar from "./CustomToolbar"; // 作成したツールバーをインポート
import "../assets/styles/CalendarView.scss";

const locales = { ja };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Stage {
  id: number;
  date: string;
  time: string;
}

interface CalendarViewProps {
  stages: Stage[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ stages }) => {
  const events = stages.map((stage) => ({
    id: stage.id,
    title: stage.time, // 時刻のみ表示
    start: new Date(`${stage.date}T${stage.time}`),
    end: new Date(`${stage.date}T${stage.time}`),
    allDay: false,
  }));

  const defaultDate = new Date(stages[0].date);

  const formats = {
    monthHeaderFormat: "yyyy年M月", // 年と月の順番を変更
    weekdayFormat: "E", // 月と日のみ表示
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        views={["month"]}
        defaultDate={defaultDate}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400, width: 500 }}
        culture="ja"
        formats={formats} // 日付と曜日のフォーマット設定
        components={{
          event: ({ event }: { event: any }) => (
            <span>{event.title}</span> // 時刻のみ表示
          ),
          toolbar: CustomToolbar, // カスタムツールバーを指定
        }}
      />
    </div>
  );
};

export default CalendarView;
