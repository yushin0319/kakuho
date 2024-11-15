import { useState, useMemo } from "react";
import { Button, Grid2 as Grid, Typography } from "@mui/material";
import { TimePicker, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ja } from "date-fns/locale/ja";

const CreateEvent = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectTimes, setSelectTimes] = useState<Record<string, Date | null>>(
    {}
  );
  const [completedTimes, setCompletedTimes] = useState<Record<string, Date[]>>(
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
    setSelectTimes((prev) => ({ ...prev, [date]: time }));
  };

  // 決定ボタンの処理
  const handleComplete = (date: string, time: Date) => {
    setCompletedTimes((prev) => {
      const newTimes = prev[date] ? [...prev[date], time] : [time];
      return { ...prev, [date]: newTimes };
    });
    setSelectTimes((prev) => ({ ...prev, [date]: null }));
  };

  // 削除ボタンの処理
  const handleDelete = (date: string, time: Date) => {
    setCompletedTimes((prev) => {
      const newTimes = prev[date].filter((t) => t !== time);
      return { ...prev, [date]: newTimes };
    });
  };

  return (
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
          });

          return (
            <Grid container spacing={2} alignItems="center" key={formattedDate}>
              <Grid size={6}>
                <Typography variant="body1" color="textSecondary">
                  {formattedDate}
                </Typography>
              </Grid>
              <Grid size={6} container spacing={2} alignItems="center">
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
                        margin: "normal",
                        fullWidth: true,
                        sx: { opacity: 0.5 },
                      },
                    }}
                  />
                </Grid>
                <Grid size={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!selectTimes[formattedDate]}
                    onClick={() =>
                      handleComplete(
                        formattedDate,
                        selectTimes[formattedDate] as Date
                      )
                    }
                  >
                    決定
                  </Button>
                </Grid>
                {completedTimes[formattedDate]?.map((time) => (
                  <Grid size={12} container key={time.toString()} spacing={2}>
                    <Grid size={8} alignContent={"center"}>
                      <Typography variant="h6" margin="none">
                        {time.toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Grid>
                    <Grid size={4}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleDelete(formattedDate, time)}
                      >
                        削除
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          );
        })}

        <Button variant="contained" color="primary" type="submit" fullWidth>
          イベント作成
        </Button>
      </LocalizationProvider>
    </form>
  );
};

export default CreateEvent;
