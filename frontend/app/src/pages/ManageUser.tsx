// app/src/pages/ManageUser.tsx
import { useState, useEffect } from "react";
import { fetchEvents } from "../services/api/event";
import { fetchEventStages } from "../services/api/stage";
import { EventResponse, StageResponse } from "../services/interfaces";
import { fetchUsers } from "../services/api/user";
import { UserResponse } from "../services/interfaces";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  Drawer,
  Button,
  Pagination,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ManageUserReservations from "../components/ManageUserReservations";
import { useReservationContext } from "../context/ReservationContext";
import { toJST } from "../services/utils";

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
  const [openSearch, setOpenSearch] = useState(false);
  const [page, setPage] = useState(1);
  const pageLimit = 7;
  const { reservations } = useReservationContext();

  // ユーザー情報とイベント情報を取得
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

  // イベントが選択されたら、そのイベントのステージを取得
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

  // ユーザーの絞り込み
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
    setPage(1); // フィルタリング条件が変わったらページをリセット
  }, [searchTerm, selectedEvent, selectedStage, users]);

  // ページネーション
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageLimit,
    page * pageLimit
  );

  // ページ変更時の処理
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container fixed>
      {/* イベントフィルタリングドロップダウン */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>イベント</InputLabel>
        <Select
          value={selectedEvent ? selectedEvent.id : ""}
          onChange={(e) => {
            const eventId = e.target.value;
            if (eventId) {
              const event = events.find((event) => event.id === eventId);
              setSelectedEvent(event || null);
            } else {
              setSelectedEvent(null);
            }
          }}
        >
          <MenuItem value="">すべてのイベント</MenuItem>
          {events.map((event) => (
            <MenuItem key={event.id} value={event.id}>
              {event.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ステージフィルタリングドロップダウン */}
      <FormControl fullWidth>
        <InputLabel sx={{ opacity: selectedEvent ? 1 : 0.3 }}>
          ステージ
        </InputLabel>
        <Select
          disabled={!selectedEvent}
          sx={{ opacity: selectedEvent ? 1 : 0.3 }}
          value={selectedStage ? selectedStage.id : ""}
          onChange={(e) => {
            const stageId = e.target.value;
            if (stageId) {
              const stage = stages.find((stage) => stage.id === stageId);
              setSelectedStage(stage || null);
            } else {
              setSelectedStage(null);
            }
          }}
        >
          <MenuItem value="">すべてのステージ</MenuItem>
          {stages.map((stage) => (
            <MenuItem key={stage.id} value={stage.id}>
              {toJST(stage.start_time, "dateTime")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ユーザーリスト */}
      <Divider />
      <Box sx={{ mt: 2 }}>
        {paginatedUsers.length === 0 && (
          <div>ユーザーが見つかりませんでした</div>
        )}
        {paginatedUsers.map((user) => (
          <Accordion key={user.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {user.nickname ? user.nickname : user.email}
              </Typography>
              <Typography sx={{ ml: 2, color: "gray" }}>
                {user.email}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ManageUserReservations userId={user.id} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Pagination
        count={Math.ceil(filteredUsers.length / pageLimit)}
        page={page}
        onChange={handlePageChange}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
      {/* 検索バー */}
      <Button
        onClick={() => setOpenSearch(!openSearch)}
        variant="outlined"
        sx={{ margin: 4 }}
      >
        ユーザー名またはメールアドレスで検索
      </Button>
      {openSearch && (
        <Drawer
          variant="temporary"
          anchor="bottom"
          open={openSearch}
          onClose={() => setOpenSearch(false)}
        >
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <TextField
              label="ユーザー名またはメールアドレスで検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </Box>
        </Drawer>
      )}
    </Container>
  );
};

export default ManageUser;
