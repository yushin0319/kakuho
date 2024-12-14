// app/src/components/ConfirmEvent.tsx
import ChairIcon from "@mui/icons-material/Chair";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSnack } from "../context/SnackContext";
import { seatDict } from "../pages/CreateEvent";
import { createEvent } from "../services/api/event";
import { createSeatGroup } from "../services/api/seatGroup";
import { createStage } from "../services/api/stage";
import { createTicketType } from "../services/api/ticketType";
import { addTime, toJST } from "../services/utils";

interface ConfirmEventProps {
  title: string;
  description: string;
  schedule: Record<string, Date[]>;
  seatDict: seatDict;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmEvent = ({
  title,
  description,
  schedule,
  seatDict,
  open,
  onClose,
  onConfirm,
}: ConfirmEventProps) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { setSnack } = useSnack();

  if (!title.trim()) errors.push("イベント名を入力してください");
  if (!description.trim()) errors.push("詳細説明を入力してください");
  if (Object.values(schedule).every((times) => times.length === 0))
    errors.push("ステージを1つ以上選択してください");
  if (Object.values(seatDict).length === 0)
    errors.push("チケット種別を1つ以上入力してください");
  Object.values(seatDict).forEach(({ seatGroup, ticketTypes }) => {
    if (!seatGroup.capacity) warnings.push("座席数が0のチケットがあります");
    if (ticketTypes.length === 0)
      warnings.push(
        "座席数のみ入力されているものがあります（チケット追加が必要です）"
      );
    ticketTypes.forEach((ticketType) => {
      if (!ticketType.type_name.trim())
        errors.push("未入力のチケット名があります");
      if (!ticketType.price) warnings.push("価格が0円のチケットがあります");
    });
  });

  // 確定ボタンの処理
  const handleConfirm = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      // イベント作成
      const event = await createEvent({ name: title, description });
      const eventId = event.id;

      // ステージ作成
      const stagePromises = Object.values(schedule)
        .flat()
        .map((time) => {
          const start_time = toJST(time, "ISO8601");
          const end_time = toJST(addTime(time, { hours: 2 }), "ISO8601");
          return createStage(eventId, { start_time, end_time });
        });

      const stages = await Promise.all(stagePromises);

      // ステージごとにシートグループとチケットタイプを作成
      for (const stage of stages) {
        for (const seats of Object.values(seatDict)) {
          const fetchedSeatGroup = await createSeatGroup(
            stage.id,
            seats.seatGroup
          );
          const seatGroupId = fetchedSeatGroup.id;

          // チケットタイプ作成
          for (const ticketType of seats.ticketTypes) {
            await createTicketType(seatGroupId, ticketType);
          }
        }
      }

      // 処理がすべて成功した場合
      setSnack({
        message: "イベントを作成しました",
        severity: "success",
      });
    } catch (error) {
      // エラー処理
      console.error("Failed to create event:", error);
      setSnack({
        message: "イベントの作成に失敗しました",
        severity: "error",
      });
    } finally {
      setIsCreating(false);
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" component="div">
          この内容でイベントを作成してもよろしいですか？
        </Typography>
        {errors.map((error, index) => (
          <Box key={index} mt={1}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ))}
        {warnings.map((warning, index) => (
          <Box key={index} mt={1}>
            <Typography variant="body2" color="warning">
              {warning}
            </Typography>
          </Box>
        ))}
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" component="div">
            イベント名
          </Typography>
          <Paper elevation={1} sx={{ padding: 2 }}>
            <Typography variant="body1">{title || "未設定"}</Typography>
          </Paper>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" component="div">
            詳細説明
          </Typography>
          <Paper elevation={1} sx={{ padding: 2 }}>
            <Typography variant="body1">{description || "未設定"}</Typography>
          </Paper>
        </Box>

        {/* 日程情報 */}
        {Object.entries(schedule).some(([_, times]) => times.length > 0) && (
          <Box mb={3}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "50%" }}>日付</TableCell>
                  <TableCell sx={{ width: "50%" }}>時間</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(schedule)
                  .sort(([a], [b]) => (a < b ? -1 : 1))
                  .map(([date, times]) => {
                    if (times.length === 0) return null; // 空のtimesをスキップ
                    return (
                      <TableRow key={date}>
                        <TableCell>{date}</TableCell>
                        <TableCell>
                          {times.map((time) => (
                            <Typography
                              key={toJST(time, "time")}
                              component="span"
                            >
                              <Chip
                                label={toJST(time, "time")}
                                sx={{ margin: 0.5 }}
                              />
                            </Typography>
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* 座席情報 */}
        <Box>
          {Object.entries(seatDict).map(([id, { seatGroup, ticketTypes }]) => (
            <Box key={id} my={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "50%" }}>チケット種別</TableCell>
                    <TableCell sx={{ width: "50%" }}>価格</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketTypes.map((ticketType) => (
                    <TableRow key={ticketType.type_name}>
                      <TableCell>{ticketType.type_name}</TableCell>
                      <TableCell>{ticketType.price}円</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box p={2} display="flex" alignItems="center">
                <ChairIcon sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="body1" component="div">
                  {seatGroup.capacity}席
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" autoFocus>
          修正
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={errors.length > 0}
        >
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmEvent;
