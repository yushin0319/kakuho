// app/src/pages/ManageUser.tsx
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useAppData } from "../context/AppData";
import { deleteUser } from "../services/api/user";
import { StageResponse, UserResponse } from "../services/interfaces";
import { toJST } from "../services/utils";

interface ManageUserForm {
  searchTerm: string;
  selectedEvent: number | "";
  selectedStage: number | "";
}

const ManageUser = () => {
  const [selectableStages, setSelectableStages] = useState<StageResponse[]>([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [page, setPage] = useState(1);
  const pageLimit = 10;
  const { events, stages, users, reservations, loading, error, reloadData } =
    useAppData();
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
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

  // ユーザー削除
  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      reloadData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  {/* ニックネーム部分 */}
                  <Typography
                    variant="body1"
                    sx={{
                      ml: 1,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap", // 改行しない
                      overflow: "hidden", // はみ出しを隠す
                      textAlign: "left",
                      textOverflow: "ellipsis", // はみ出し部分を「…」にする
                    }}
                  >
                    {user.nickname || user.email}
                  </Typography>

                  {/* メールアドレス部分 */}
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 1,
                      lineHeight: 1,
                      color: "lightgray",
                      whiteSpace: "nowrap", // 改行しない
                      textAlign: "left",
                      overflow: "hidden", // はみ出しを隠す
                      textOverflow: "ellipsis", // はみ出し部分を「…」にする
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <ManageUserReservations userId={user.id} />
                <Button
                  onClick={() => setDeletingUser(user)}
                  variant="outlined"
                  color="error"
                  sx={{ mt: 2 }}
                >
                  ユーザーを削除
                </Button>
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
        sx={{
          my: 4,
          px: 8,
        }}
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
      {deletingUser && (
        <Dialog
          open={Boolean(deletingUser)}
          onClose={() => setDeletingUser(null)}
          onClick={(e) => e.stopPropagation()}
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: "error.main",
              color: "error.contrastText",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                mb: 2,
              }}
            >
              ユーザを削除しますか？
            </Typography>
            <Typography variant="body2" color="error.contrastText">
              紐づく予約も削除されます。
            </Typography>
            <Typography variant="body2" color="error.contrastText">
              この操作は取り消せません。
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mt: 2,
              }}
            >
              <Typography variant="subtitle2" color="secondary">
                ユーザー名
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: "bold",
                }}
              >
                {deletingUser.nickname || deletingUser.email}
              </Typography>
              <Typography variant="subtitle2" color="secondary">
                メールアドレス
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {deletingUser.email}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                width: "100%",
                mt: 2,
              }}
            >
              <Button
                onClick={() => {
                  handleDeleteUser(deletingUser.id);
                  setDeletingUser(null);
                }}
                variant="contained"
                color="error"
              >
                削除
              </Button>
              <Button
                onClick={() => setDeletingUser(null)}
                variant="outlined"
                color="error"
              >
                キャンセル
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default ManageUser;
