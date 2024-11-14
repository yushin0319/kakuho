import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ja } from "date-fns/locale/ja";

const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [ticketType, setTicketType] = useState("");

  return (
    <form>
      <TextField
        label="イベント名"
        variant="outlined"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="イベント説明"
        variant="outlined"
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
        fullWidth
        multiline
        margin="normal"
      />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        <DatePicker
          label="イベント日"
          value={eventDate}
          onChange={(newValue) => setEventDate(newValue)}
          slotProps={{
            textField: {
              variant: "outlined",
              fullWidth: true,
              margin: "normal",
            },
            calendarHeader: {
              format: "yyyy年 M月",
            },
          }}
        />
      </LocalizationProvider>
      <FormControl fullWidth margin="normal">
        <InputLabel>チケットタイプ</InputLabel>
        <Select
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          label="チケットタイプ"
        >
          <MenuItem value="一般">一般</MenuItem>
          <MenuItem value="学生">学生</MenuItem>
          <MenuItem value="特別">特別</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" type="submit" fullWidth>
        イベント作成
      </Button>
    </form>
  );
};

export default CreateEvent;
