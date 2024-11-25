// app/src/components/ConfirmEvent.tsx
import { useState, useEffect } from "react";
import { createEvent } from "../services/api/event";
import { createStage } from "../services/api/stage";
import { createSeatGroup } from "../services/api/seatGroup";
import { createTicketType } from "../services/api/ticketType";
import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import ChairIcon from "@mui/icons-material/Chair";
import { toJST, addTime } from "../services/utils";
import { seatProps } from "./CreateEvent";

interface ConfirmEventProps {
  title: string;
  description: string;
  completedTimes: Record<string, Date[]>;
  seatGroups: seatProps[];
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmEvent = ({
  title,
  description,
  completedTimes,
  seatGroups,
  open,
  onClose,
  onConfirm,
}: ConfirmEventProps) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    const check = () => {
      const errors = [];
      const warnings = [];
      // titleが空の場合
      if (title === "") {
        errors.push("イベント名を入力してください");
      }
      // descriptionが空の場合
      if (description === "") {
        errors.push("詳細説明を入力してください");
      }
      // ステージが1つも選択されていない場合
      if (
        Object.values(completedTimes as Record<string, Date[]>).every(
          (times) => times.length === 0
        )
      ) {
        errors.push("ステージを1つ以上選択してください");
      }
      // チケット種別が1つもない場合
      if (seatGroups.length === 0) {
        errors.push("チケット種別を1つ以上入力してください");
      }
      // チケット名が空のものがある場合
      if (
        seatGroups.some((seatGroup) =>
          seatGroup.ticketTypes.some(
            (ticketType) => ticketType.type_name === ""
          )
        )
      ) {
        errors.push("未入力のチケット名があります");
      }
      // 座席数が0のグループがある場合
      if (seatGroups.some((seatGroup) => seatGroup.seatGroup.capacity === 0)) {
        warnings.push("座席数が0のチケットがあります");
      }
      // 価格が0のチケットがある場合
      if (
        seatGroups.some((seatGroup) =>
          seatGroup.ticketTypes.some((ticketType) => ticketType.price === 0)
        )
      ) {
        warnings.push("価格が0円のチケットがあります");
      }
      // 座席数のみ入力されているグループがある場合
      if (seatGroups.some((seatGroup) => seatGroup.ticketTypes.length === 0)) {
        warnings.push(
          "座席数のみ入力されているものがあります（チケット追加が必要です）"
        );
      }

      setErrors(errors);
      setWarnings(warnings);
    };
    check();
  }, [title, description, completedTimes, seatGroups]);

  // 確定ボタンの処理
  const handleConfirm = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      // イベント作成
      const event = await createEvent({ name: title, description });
      const eventId = event.id;

      // ステージ作成
      const stagePromises = Object.values(completedTimes)
        .flat()
        .map((time) => {
          // タイムゾーン補正を行う関数
          const start_time = toJST(time, "ISO8601");
          const end_time = toJST(addTime(time, { hours: 2 }), "ISO8601");
          return createStage(eventId, { start_time, end_time });
        });

      const stages = await Promise.all(stagePromises);

      // 座席グループ作成
      const seatGroupPromises = seatGroups.flatMap((seatGroup) =>
        stages.map(async (stage) => {
          const fetchedSeatGroup = await createSeatGroup(
            stage.id,
            seatGroup.seatGroup
          );
          const seatGroupId = fetchedSeatGroup.id;

          // チケットタイプ作成
          const ticketTypePromises = seatGroup.ticketTypes.map((ticketType) =>
            createTicketType(seatGroupId, ticketType)
          );
          return Promise.all(ticketTypePromises);
        })
      );

      await Promise.all(seatGroupPromises);

      // 処理がすべて成功した場合
      console.log("イベント作成成功");
    } catch (error) {
      // エラー処理
      console.error("エラーが発生しました:", error);
    } finally {
      setIsCreating(false);
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEnforceFocus
      aria-hidden={!open}
    >
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
        {Object.entries(completedTimes).some(
          ([_, times]) => times.length > 0
        ) && (
          <Box mb={3}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "50%" }}>日付</TableCell>
                  <TableCell sx={{ width: "50%" }}>時間</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(completedTimes)
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
        {seatGroups.length > 0 && (
          <>
            {seatGroups.map((seatGroup) => (
              <Box key={seatGroup.id} my={2}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "50%" }}>チケット種別</TableCell>
                      <TableCell sx={{ width: "50%" }}>価格</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seatGroup.ticketTypes.map((ticketType) => (
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
                    {seatGroup.seatGroup.capacity}席
                  </Typography>
                </Box>
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
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
