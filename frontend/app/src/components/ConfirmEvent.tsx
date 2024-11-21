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
  Divider,
  Paper,
} from "@mui/material";
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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" component="div">
          イベント確認
        </Typography>
      </DialogTitle>
      <DialogContent>
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
          <>
            <Typography variant="h6" component="div">
              日程情報
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日付</TableCell>
                  <TableCell>時間</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(completedTimes).map(([date, times]) => {
                  if (times.length === 0) return null; // 空のtimesをスキップ
                  return (
                    <TableRow key={date}>
                      <TableCell>{date}</TableCell>
                      <TableCell>
                        {times.map((time) => (
                          <Typography key={time.toString()} component="span">
                            {time.toLocaleTimeString()}{" "}
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* 座席情報 */}
        {seatGroups.length > 0 && (
          <>
            <Typography variant="h6" component="div">
              座席情報
            </Typography>
            {seatGroups.map((seatGroup) => (
              <Box
                key={seatGroup.id}
                mb={2}
                sx={{ borderBottom: "1px solid #ccc", pb: 2 }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {seatGroup.seatGroup.capacity}席
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>チケット種別</TableCell>
                      <TableCell>価格</TableCell>
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
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          キャンセル
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          確定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmEvent;
