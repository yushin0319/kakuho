import { useState, useMemo } from "react";
import {
  Button,
  Grid2 as Grid,
  Typography,
  Divider,
  Card,
  Chip,
} from "@mui/material";
import { TimePicker, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ja } from "date-fns/locale/ja";

interface EditStageProps {
  startDate: Date | null;
  endDate: Date | null;
  completedTimes: Record<string, Date[]>;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  handleComplete: (date: string, time: Date) => void;
  handleDelete: (date: string, time: Date) => void;
}

const EditStage = ({
  startDate = null,
  endDate = null,
  completedTimes = {},
  setStartDate,
  setEndDate,
  handleComplete,
  handleDelete,
}: EditStageProps) => {
  const [selectTimes, setSelectTimes] = useState<Record<string, Date | null>>(
    {}
  );

  // 開始日から終了日までの日付リストを生成（useMemoで最適化）
  const dateList = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  // 時間変更ハンドラ
  const handleStageTimeChange = (date: string, time: Date | null) => {
    const newTime = new Date(date);
    if (time) {
      newTime.setHours(time.getHours());
      newTime.setMinutes(time.getMinutes());
      newTime.setSeconds(0);
    }
    setSelectTimes((prev) => ({ ...prev, [date]: newTime }));
  };

  return (
    <Card sx={{ padding: "16px", margin: "16px" }}>
      <form>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <DatePicker
                label="開始日"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    margin: "normal",
                  },
                }}
                minDate={new Date()}
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
              />
            </Grid>
            <Grid size={6}>
              <DatePicker
                label="終了日"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    margin: "normal",
                    disabled: !startDate,
                    sx: {
                      opacity: startDate ? 1 : 0.5,
                    },
                  },
                }}
                minDate={startDate || new Date()}
                maxDate={
                  startDate
                    ? new Date(
                        new Date(startDate).setMonth(
                          new Date(startDate).getMonth() + 2
                        )
                      )
                    : new Date()
                }
              />
            </Grid>
          </Grid>

          {dateList.map((date) => {
            const formattedDate = date.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              weekday: "short",
            });

            return (
              <div key={formattedDate}>
                <Divider sx={{ margin: "15px" }} />
                <Grid container spacing={2} alignItems="center">
                  <Grid size={6}>
                    <Typography variant="body1" color="textSecondary">
                      {formattedDate}
                    </Typography>
                  </Grid>
                  <Grid size={6} container spacing={2} alignItems="center">
                    <Grid size={12} container>
                      {completedTimes[formattedDate]?.map((time) => (
                        <Grid
                          size="auto"
                          container
                          alignItems="center"
                          spacing={2}
                          key={time.toString()}
                        >
                          <Chip
                            label={time.toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            variant="outlined"
                            color="primary"
                            onDelete={() => handleDelete(formattedDate, time)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Grid size={8}>
                      <TimePicker
                        label="ステージ追加"
                        value={selectTimes[formattedDate] || null}
                        onChange={(newValue) =>
                          handleStageTimeChange(formattedDate, newValue)
                        }
                        slotProps={{
                          textField: {
                            variant: "standard",
                            sx: { opacity: 0.5 },
                          },
                        }}
                      />
                    </Grid>
                    <Grid size="auto">
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={!selectTimes[formattedDate]}
                        onClick={() => {
                          handleComplete(
                            formattedDate,
                            selectTimes[formattedDate] as Date
                          );
                          setSelectTimes((prev) => ({
                            ...prev,
                            [formattedDate]: null,
                          }));
                        }}
                      >
                        追加
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            );
          })}
        </LocalizationProvider>
      </form>
    </Card>
  );
};

export default EditStage;
