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
import { toJST, addTime } from "../services/utils";

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

  const styles = {
    mobiledialogprops: {
      ".MuiDatePickerToolbar-title": {
        fontSize: "1.5rem",
      },
    },
  };

  return (
    <Card sx={{ p: 2 }}>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={ja}
        localeText={{
          nextMonth: "次の月",
          previousMonth: "前の月",
          day: "日",
          month: "月",
          year: "年",
          cancelButtonLabel: "キャンセル",
          okButtonLabel: "OK",
        }}
      >
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
                calendarHeader: { format: "yyyy年MM月" },
                toolbar: { toolbarFormat: "yyyy年MM月dd日" },
                dialog: {
                  sx: styles.mobiledialogprops,
                },
              }}
              minDate={new Date()}
              maxDate={addTime(new Date(), { years: 1 })}
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
                },
                calendarHeader: { format: "yyyy年MM月" },
                toolbar: { toolbarFormat: "yyyy年MM月dd日" },
                dialog: {
                  sx: styles.mobiledialogprops,
                },
              }}
              minDate={startDate || new Date()}
              maxDate={
                startDate ? addTime(startDate, { months: 2 }) : new Date()
              }
            />
          </Grid>
        </Grid>

        {dateList.map((date) => {
          const formattedDate = toJST(date, "fullDate");

          return (
            <div key={formattedDate}>
              <Divider sx={{ m: 2 }} />
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1" color="textSecondary">
                    {formattedDate}
                  </Typography>
                </Grid>
                <Grid
                  size={{ xs: 12, md: 6 }}
                  container
                  spacing={2}
                  alignItems="center"
                >
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
                          label={toJST(time, "time")}
                          variant="outlined"
                          color="primary"
                          onDelete={() => handleDelete(formattedDate, time)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TimePicker
                      label="開始時間を選択して下さい"
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
                  <Grid size={{ xs: 12, md: 4 }}>
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
    </Card>
  );
};

export default EditStage;
