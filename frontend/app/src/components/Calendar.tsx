import { Box, Button, Card, Chip, Grid2 as Grid, Typography } from "@mui/material";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../context/AppData";
import { EventResponse, StageResponse } from "../services/interfaces";
import { toJST, toJSTDate } from "../services/utils";
import ReservationCreater from "./ReservationCreater";

// カレンダー範囲を取得するヘルパー関数
function getCalendarDays(targetDate: Date): Date[] {
  const firstDayOfMonth = startOfMonth(targetDate);
  const lastDayOfMonth = endOfMonth(targetDate);

  const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

interface CalendarProps {
  event: EventResponse;
  onBack: () => void;
}

const Calendar = ({ event, onBack }: CalendarProps) => {
  const { stages, seatGroups } = useAppData();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectableStages, setSelectableStages] = useState<StageResponse[]>([]);
  const [selectedStage, setSelectedStage] = useState<StageResponse>(stages[0]);
  const [reservationCreaterOpen, setReservationCreaterOpen] = useState(false);

  // イベントに紐づくステージを取得する
  useEffect(() => {
    let newCurrentDate = new Date(3000, 1, 1);
    const updatedStages = stages.filter((stage) => stage.event_id === event.id);

    updatedStages.forEach((stage) => {
      const stageDate = toJSTDate(stage.start_time);
      if (stageDate < newCurrentDate) {
        newCurrentDate = stageDate;
      }
    });

    setCurrentDate(newCurrentDate);
    setSelectableStages(updatedStages);
  }, [stages, event]);

  // Min-KK-09: 月移動制限のためのステージ最小・最大日を計算
  const { minStageMonth, maxStageMonth } = useMemo(() => {
    if (selectableStages.length === 0) {
      return { minStageMonth: null, maxStageMonth: null };
    }
    const dates = selectableStages.map((s) => toJSTDate(s.start_time));
    const minDate = dates.reduce((min, d) => (d < min ? d : min), dates[0]);
    const maxDate = dates.reduce((max, d) => (d > max ? d : max), dates[0]);
    return {
      minStageMonth: startOfMonth(minDate),
      maxStageMonth: startOfMonth(maxDate),
    };
  }, [selectableStages]);

  const isPrevDisabled =
    minStageMonth !== null &&
    startOfMonth(currentDate) <= minStageMonth;

  const isNextDisabled =
    maxStageMonth !== null &&
    startOfMonth(currentDate) >= maxStageMonth;

  // 週のうち最大ステージ数のある日のステージ数を取得する
  const weeksMax = (day: Date) => {
    const firstDayOfWeek = startOfWeek(day, { weekStartsOn: 1 });
    let maxofWeek = 0;
    for (let i = 0; i < 7; i++) {
      let max = 0;

      const date = addDays(firstDayOfWeek, i);
      selectableStages.forEach((stage) => {
        if (toJST(stage.start_time, "fullDate") === toJST(date, "fullDate")) {
          max++;
        }
      });
      if (max > maxofWeek) {
        maxofWeek = max;
      }
    }
    return maxofWeek;
  };

  const isSoldOut = (stage: StageResponse): boolean => {
    const groupsForStages = seatGroups.filter((sg) => sg.stage_id === stage.id);
    return groupsForStages.every((sg) => sg.capacity === 0);
  };

  const calendarDays = getCalendarDays(currentDate);

  // 前月・翌月へのボタンハンドラー
  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  return (
    <Box>
      {/* ヘッダー */}
      <Typography variant="body1">{event.name}</Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          onClick={handlePrevMonth}
          variant="outlined"
          disabled={isPrevDisabled}
        >
          前月
        </Button>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
          }}
        >
          {format(currentDate, "yyyy年M月", { locale: ja })}
        </Typography>
        <Button
          onClick={handleNextMonth}
          variant="outlined"
          disabled={isNextDisabled}
        >
          翌月
        </Button>
      </Box>

      {/* 曜日ヘッダー */}
      <Card
        sx={{
          backgroundColor: "white",
        }}
      >
        <Grid container spacing={1} textAlign="center">
          {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
            <Grid size={12 / 7} key={day}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{
                  color:
                    day === "土"
                      ? "lightskyblue"
                      : day === "日"
                      ? "lightcoral"
                      : "gray",
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 日付部分 */}
      <Card
        sx={{
          mt: 1,
          mb: 2,
        }}
      >
        <Grid container>
          {calendarDays.map((day, index) => {
            const isCurrentMonth =
              format(day, "M") === format(currentDate, "M");
            const isToday =
              toJST(day, "fullDate") === toJST(new Date(), "fullDate");
            return (
              <Grid size={12 / 7} key={index}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-start"
                  height={weeksMax(day) * 40 + 50}
                  sx={{
                    backgroundColor: isToday
                      ? "lightyellow"
                      : isCurrentMonth
                      ? "white"
                      : "lightgray",
                    borderLeft: isCurrentMonth ? "1px solid #f0f0f0" : "none",
                    borderBottom: isCurrentMonth ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Typography variant="caption">{format(day, "d")}</Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      height: "100%",
                    }}
                  >
                    {selectableStages
                      .filter(
                        (stage) =>
                          toJST(stage.start_time, "fullDate") ===
                          toJST(day, "fullDate")
                      )
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((stage) => {
                        const soldOut = isSoldOut(stage);
                        return (
                          <Button
                            key={stage.id}
                            variant="contained"
                            sx={{
                              mb: 1,
                              py: 0.5,
                              minWidth: "90%",
                              width: "90%",
                              backgroundColor: "secondary.main",
                              color: "white",
                              borderRadius: 1,
                              flexDirection: "column",
                            }}
                            onClick={() => {
                              setSelectedStage(stage);
                              setReservationCreaterOpen(true);
                            }}
                            disabled={soldOut}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                              }}
                            >
                              {toJST(stage.start_time, "time")}
                            </Typography>
                            {/* Min-KK-10: 完売バッジ */}
                            {soldOut && (
                              <Chip
                                label="完売"
                                size="small"
                                color="error"
                                sx={{
                                  height: 16,
                                  fontSize: "0.65rem",
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                          </Button>
                        );
                      })}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Card>
      <Button onClick={onBack} variant="outlined" fullWidth>
        <Typography variant="body1">イベント一覧に戻る</Typography>
      </Button>
      {reservationCreaterOpen && (
        <ReservationCreater
          event={event}
          stage={selectedStage}
          onClose={() => setReservationCreaterOpen(false)}
        />
      )}
    </Box>
  );
};

export default Calendar;
