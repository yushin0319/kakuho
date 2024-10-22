import React, { useState, useEffect } from "react";
import { fetchEvents } from "../services/api/event"; // API関数をインポート
import { fetchEventStages } from "../services/api/stage"; // Stage API関数をインポート
import { EventResponse, StageResponse } from "../services/interfaces"; // Interfaceをインポート
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const [events, setEvents] = useState<EventResponse[]>([]); // イベントリストを保持するstate
  const [stages, setStages] = useState<Record<number, StageResponse[]>>({}); // イベントごとのステージ情報を保持するstate

  useEffect(() => {
    // イベントを取得して、そのIDごとにステージを取得
    fetchEvents()
      .then(async (data) => {
        setEvents(data);
        // 各イベントごとにステージを取得
        const stagesData: Record<number, StageResponse[]> = {};
        for (const event of data) {
          try {
            const eventStages = await fetchEventStages(event.id);
            stagesData[event.id] = eventStages;
          } catch (error) {
            console.error(
              `Error fetching stages for event ${event.id}:`,
              error
            );
          }
        }
        setStages(stagesData);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  return (
    <div className="home-container">
      <h2>Upcoming Events</h2>
      {events && events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <span>
                {event.name} - {event.description}
              </span>
              {/* イベント詳細ページへのリンク */}
              <Link to={`/events/${event.id}`}>
                <button>View Details</button>
              </Link>

              {/* ステージ情報をリスト表示 */}
              {stages[event.id] && stages[event.id].length > 0 ? (
                <ul>
                  {stages[event.id].map((stage) => (
                    <li key={stage.id}>
                      <span>
                        Capacity: {stage.capacity} -{" "}
                        {new Date(stage.start_time).toLocaleString()} ~{" "}
                        {new Date(stage.end_time).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No stages found for this event</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No events found</p>
      )}
    </div>
  );
};

export default Home;
