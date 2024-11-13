import { useState, useEffect } from "react";
import { fetchEvents } from "../services/api/event";
import { fetchEventStages } from "../services/api/stage";
import { EventResponse, StageResponse } from "../services/interfaces";
import { fetchUsers } from "../services/api/user";
import { UserResponse } from "../services/interfaces";
import ManageUserReservations from "../components/ManageUserReservations";
import { useReservationContext } from "../context/ReservationContext";
import "../assets/styles/ManageUser.scss";

const ManageUser = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null
  );
  const [selectedStage, setSelectedStage] = useState<StageResponse | null>(
    null
  );
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [stages, setStages] = useState<StageResponse[]>([]);
  const { reservations } = useReservationContext();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const users = await fetchUsers();
        setUsers(users);
        setFilteredUsers(users); // 初期値を全ユーザーで設定
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    const fetchEventsData = async () => {
      try {
        const events = await fetchEvents();
        setEvents(events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchUsersData();
    fetchEventsData();
  }, []);

  useEffect(() => {
    if (!selectedEvent) {
      setStages([]); // イベントが未選択になった場合、ステージをクリア
      setSelectedStage(null); // ステージもリセット
      return;
    }
    const fetchStagesData = async () => {
      try {
        const stages = await fetchEventStages(selectedEvent.id);
        setStages(stages);
        setSelectedStage(null); // 新しいイベントを選んだ時にステージをリセット
      } catch (error) {
        console.error("Failed to fetch stages:", error);
      }
    };
    fetchStagesData();
  }, [selectedEvent]);

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedEvent) {
      filtered = filtered.filter((user) => {
        const userReservations = reservations.filter(
          (res) => res.user.id === user.id
        );
        return userReservations.some(
          (res) => res.event.id === selectedEvent.id
        );
      });
    }

    if (selectedStage) {
      filtered = filtered.filter((user) => {
        const userReservations = reservations.filter(
          (res) => res.user.id === user.id
        );
        return userReservations.some(
          (res) => res.stage.id === selectedStage.id
        );
      });
    }
    setFilteredUsers(filtered);
  }, [searchTerm, selectedEvent, selectedStage, users]);

  return (
    <div className="manage-user">
      <h1>ユーザー管理</h1>

      {/* 検索バー */}
      <input
        type="text"
        placeholder="ユーザー名またはメールアドレスで検索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* イベントフィルタリングドロップダウン */}
      <select
        value={selectedEvent ? selectedEvent.id : ""}
        onChange={(e) => {
          const eventId = e.target.value;
          if (eventId) {
            const event = events.find(
              (event) => event.id === parseInt(eventId)
            );
            setSelectedEvent(event || null);
          } else {
            setSelectedEvent(null);
          }
        }}
      >
        <option value="">すべてのイベント</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      {/* ステージフィルタリングドロップダウン */}
      <select
        value={selectedStage ? selectedStage.id : ""}
        onChange={(e) => {
          const stageId = e.target.value;
          if (stageId) {
            const stage = stages.find(
              (stage) => stage.id === parseInt(stageId)
            );
            setSelectedStage(stage || null);
          } else {
            setSelectedStage(null);
          }
        }}
      >
        <option value="">すべてのステージ</option>
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.start_time}
          </option>
        ))}
      </select>

      {/* ユーザーリスト */}
      <ul className="user-list">
        {filteredUsers.map((user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
};

const UserItem = ({ user }: { user: UserResponse }) => {
  const [showReservations, setShowReservations] = useState(false);

  const handleToggleReservations = () => {
    setShowReservations(!showReservations);
  };

  return (
    <li className="user-item">
      <div className="user-info">
        <p>{user.nickname ? user.nickname : user.email}</p>
        <button onClick={handleToggleReservations}>
          {showReservations ? "予約を閉じる" : "予約を表示"}
        </button>
      </div>
      {showReservations && <ManageUserReservations userId={user.id} />}
    </li>
  );
};

export default ManageUser;
