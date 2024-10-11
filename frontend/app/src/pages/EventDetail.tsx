import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// サンプルデータ
const sampleEvent = {
  id: 1,
  name: "Sample Event 1",
  description: "This is a sample event description.",
  start_date: "2024-10-15",
  end_date: "2024-10-18",
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
      {/* カレンダーなどを後で追加可能 */}
    </div>
  );
};

export default EventDetail;
