import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CalendarView from "../components/CalendarView";

// サンプルイベントデータ
const sampleEvent = {
  id: 1,
  name: "Sample Event 1",
  description: "This is a sample event description.",
  start_date: "2024-11-01",
  end_date: "2024-11-03",
  stages: [
    { id: 1, date: "2024-11-01", time: "19:00" },
    { id: 2, date: "2024-11-02", time: "11:00" },
    { id: 3, date: "2024-11-02", time: "16:00" },
    { id: 4, date: "2024-11-03", time: "11:00" },
    { id: 5, date: "2024-11-03", time: "16:00" },
  ],
};

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // イベントIDを取得
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    // 本来のAPI呼び出しをコメントアウト
    // axios.get(`http://127.0.0.1:8000/events/${id}`)
    //   .then((response) => setEvent(response.data))
    //   .catch((error) => console.error('Error fetching event details:', error));

    // サンプルデータを使用
    setEvent(sampleEvent);
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-detail-container">
      <h2>{event.name}</h2>
      <p>Description: {event.description}</p>
      <p>Start Date: {new Date(event.start_date).toLocaleDateString()}</p>
      <p>End Date: {new Date(event.end_date).toLocaleDateString()}</p>

      {/* カレンダービューコンポーネントにイベントとステージ情報を渡す */}
      <CalendarView stages={event.stages} />
    </div>
  );
};

export default EventDetail;
