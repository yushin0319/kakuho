import React, { useEffect, useState } from "react";
import axios from "axios";

interface Event {
  id: number;
  name: string;
  date: string;
}

interface Reservation {
  id: number;
  name: string;
  count: number;
}

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [count, setCount] = useState<number>(1);
  const [reservationMessage, setReservationMessage] = useState<string>("");
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    // イベント一覧を取得
    axios
      .get("http://127.0.0.1:8000/events/")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  const handleReservationSubmit = () => {
    if (!selectedEventId || !name || count <= 0) {
      setReservationMessage("すべてのフィールドを正しく入力してください");
      return;
    }

    const reservation = {
      event_id: selectedEventId,
      name: name,
      count: count,
    };

    // POST /reservations/ リクエスト
    axios
      .post("http://127.0.0.1:8000/reservations/", reservation)
      .then(() => {
        setReservationMessage("予約が正常に作成されました");
        fetchReservations(selectedEventId!); // 予約の一覧を更新
      })
      .catch((error) => {
        setReservationMessage("予約の作成に失敗しました");
        console.error("Error creating reservation:", error);
      });
  };

  const fetchReservations = (eventId: number) => {
    // GET /reservations/{event_id} リクエスト
    axios
      .get(`http://127.0.0.1:8000/reservations/${eventId}`)
      .then((response) => {
        setReservations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching reservations:", error);
      });
  };

  const handleEventSelect = (eventId: number) => {
    setSelectedEventId(eventId);
    if (eventId) {
      fetchReservations(eventId); // イベントを選択すると予約一覧を取得
    }
  };

  return (
    <div>
      <h1>イベント一覧</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.name} - {event.date}
          </li>
        ))}
      </ul>

      <h2>予約フォーム</h2>
      <div>
        <label>イベントを選択してください：</label>
        <select
          onChange={(e) => handleEventSelect(Number(e.target.value))}
          value={selectedEventId || ""}
        >
          <option value="">イベントを選択</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>名前：</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>人数：</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </div>

      <button onClick={handleReservationSubmit}>予約する</button>

      {reservationMessage && <p>{reservationMessage}</p>}

      <h2>予約一覧</h2>
      {reservations.length > 0 ? (
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.id}>
              {reservation.name} - {reservation.count} 人
            </li>
          ))}
        </ul>
      ) : (
        <p>このイベントに予約はまだありません。</p>
      )}
    </div>
  );
};

export default App;
