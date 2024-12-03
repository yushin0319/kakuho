// app/src/pages/ManageUser.tsx
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import LoadingScreen from "../components/LoadingScreen";
import ManageUserReservations from "../components/ManageUserReservations";
import { useEventData } from "../context/EventDataContext";
import { useReservationContext } from "../context/ReservationContext";
import { fetchUsers } from "../services/api/user";
import { StageResponse, UserResponse } from "../services/interfaces";
import { toJST } from "../services/utils";

interface ManageUserForm {
  searchTerm: string;
  selectedEvent: number | "";
  selectedStage: number | "";
}

const ManageUser = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectableStages, setSelectableStages] = useState<StageResponse[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [page, setPage] = useState(1);
  const pageLimit = 10;
  const { reservations } = useReservationContext();
  const { events, stages, loading, error } = useEventData();
  const { control, watch, setValue } = useForm<ManageUserForm>({
    defaultValues: {
      searchTerm: "",
      selectedEvent: "",
      selectedStage: "",
    },
  });
  const searchTerm = watch("searchTerm");
  const selectedEvent = watch("selectedEvent");
  const selectedStage = watch("selectedStage");

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const users = await fetchUsers();
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsersData();
  }, []);

  // イベントが選択されたら、そのイベントのステージを取得
  useEffect(() => {
    setValue("selectedStage", "");
    const filteredStages = stages.filter(
      (stage) => stage.event_id === selectedEvent
    );
    setSelectableStages(filteredStages);
  }, [selectedEvent]);

  // ユーザーの絞り込み
  useEffect(() => {
    setPage(1); // フィルタリング条件が変わったらページをリセット
  }, [searchTerm, selectedEvent, selectedStage, users]);

  // ユーザーの絞り込み
  const filteredUsers = useMemo(() => {
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
        return userReservations.some((res) => res.event.id === selectedEvent);
      });
    }

    if (selectedStage) {
      filtered = filtered.filter((user) => {
        const userReservations = reservations.filter(
          (res) => res.user.id === user.id
        );
        return userReservations.some((res) => res.stage.id === selectedStage);
      });
    }
    return filtered;
  }, [searchTerm, selectedEvent, selectedStage, users]);

  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
      {loading && <LoadingScreen />}
      {/* イベントフィルタリングドロップダウン */}
      <Controller
        name="selectedEvent"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="event-select">イベント</InputLabel>
            <Select {...field} inputProps={{ id: "event-select" }}>
              <MenuItem value="">すべてのイベント</MenuItem>
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {/* ステージフィルタリングドロップダウン */}
      <Controller
        name="selectedStage"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel
              htmlFor="stage-select"
              sx={{ opacity: selectedEvent ? 1 : 0.3 }}
            >
              ステージ
            </InputLabel>
            <Select
              disabled={!selectedEvent}
              sx={{ opacity: selectedEvent ? 1 : 0.3 }}
              {...field}
              inputProps={{ id: "stage-select" }}
            >
              <MenuItem value="">すべてのステージ</MenuItem>
              {selectableStages.map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>
                  {toJST(stage.start_time, "dateTime")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {/* ユーザーリスト */}
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ mt: 2 }}>
        {filteredUsers.length === 0 && (
          <Typography>ユーザーが見つかりませんでした</Typography>
        )}
        {filteredUsers
          .slice((page - 1) * pageLimit, page * pageLimit)
          .map((user) => (
            <Accordion key={user.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.nickname || user.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    ml: 2,
                    color: "gray",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ManageUserReservations userId={user.id} />
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
      {filteredUsers.length > pageLimit && (
        <Pagination
          count={Math.ceil(filteredUsers.length / pageLimit)}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      )}
      {/* 検索バー */}
      <Button
        onClick={() => setOpenSearch(!openSearch)}
        variant="outlined"
        sx={{ margin: 4 }}
      >
        検索
      </Button>
      {openSearch && (
        <Drawer
          variant="temporary"
          anchor="bottom"
          open={openSearch}
          onClose={() => setOpenSearch(false)}
        >
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <Controller
              name="searchTerm"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="名前またはメールアドレス"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </Box>
        </Drawer>
      )}
    </Container>
  );
};

export default ManageUser;
