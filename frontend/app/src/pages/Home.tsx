// import React, { useState } from "react";
// import axios from 'axios';
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const sampleEvents = [
    { id: 1, name: "Sample Event 1", start_date: "2024-10-15" },
    { id: 2, name: "Sample Event 2", start_date: "2024-10-20" },
    { id: 3, name: "Sample Event 3", start_date: "2024-10-25" },
  ];

  // const [events, setEvents] = useState<any[]>([]);

  // useEffect(() => {
  //   axios.get('http://127.0.0.1:8000/events')
  //     .then((response) => {
  //       const upcomingEvents = response.data.filter((event: any) => {
  //         const eventDate = new Date(event.start_date);
  //         const today = new Date();
  //         return eventDate > today;
  //       });
  //       setEvents(upcomingEvents);
  //     })
  //     .catch((error) => console.error('Error fetching events:', error));
  // }, []);

  return (
    <div className="home-container">
      <h2>Upcoming Events</h2>
      <ul>
        {sampleEvents.map((event) => (
          <li key={event.id}>
            <span>
              {event.name} - {new Date(event.start_date).toLocaleDateString()}
            </span>
            {/* イベント詳細ページへのリンク */}
            <Link to={`/events/${event.id}`}>
              <button>View Details</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
