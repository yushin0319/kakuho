import { Box, Button } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ja } from "date-fns/locale/ja";
import { useState } from "react";

const ValidatedTimePicker = ({
  date,
  label,
  addSchedule,
}: {
  date: string;
  label: string;
  addSchedule: (date: string, time: Date) => void;
}) => {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const handleAddTime = () => {
    if (selectedTime) {
      addSchedule(date, selectedTime);
      setSelectedTime(null); // 選択をリセット
    }
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={ja}
      localeText={{
        cancelButtonLabel: "キャンセル",
        okButtonLabel: "OK",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-around"
        sx={{
          width: "100%",
        }}
      >
        <TimePicker
          label={label}
          value={selectedTime}
          onChange={(time) => setSelectedTime(time)}
          slotProps={{
            textField: {
              variant: "standard",
              error: false, // バリデーションエラーを適用する場合はここで調整
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedTime} // 時間が選択されていない場合は無効化
          onClick={handleAddTime}
        >
          追加
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default ValidatedTimePicker;
