// app/src/pages/CreateEvent.tsx

import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ConfirmEvent from "../components/ConfirmEvent";
import CreateSeatGroup from "../components/CreateSeatGroup";
import ValidatedDatePicker from "../components/ValidatedDatePicker";
import ValidatedForm from "../components/ValidatedForm";
import ValidatedTimePicker from "../components/ValidatedTimePicker";
import { SeatGroupCreate, TicketTypeCreate } from "../services/interfaces";
import { addTime, toJST } from "../services/utils";

export type seatDict = {
  [id: number]: {
    seatGroup: SeatGroupCreate;
    ticketTypes: TicketTypeCreate[];
  };
};

const CreateEvent = () => {
  const methods = useForm({
    defaultValues: {
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      schedule: {} as Record<string, Date[]>,
      seatDict: {
        0: {
          seatGroup: {
            capacity: 0,
          },
          ticketTypes: [{ type_name: "一般", price: 0 }],
        },
      } as seatDict,
    },
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { setValue, getValues, handleSubmit, watch } = methods;

  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchSchedule = watch("schedule");
  const watchSeatDict = watch("seatDict");

  // 開始日から終了日までの日付リストを生成
  const eventDates = useMemo(() => {
    if (!watchStartDate || !watchEndDate) return [];
    const dates = [];
    let currentDate = new Date(watchStartDate);
    while (currentDate <= new Date(watchEndDate)) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [watchStartDate, watchEndDate]);

  // 日付変更時にscheduleの更新
  useEffect(() => {
    const now = getValues("schedule");
    const updated: Record<string, Date[]> = {};
    eventDates.forEach((date) => {
      const key = toJST(date, "fullDate");
      updated[key] = now[key] || [];
    });
    setValue("schedule", updated);
  }, [eventDates]);

  // スケジュールの追加
  const addSchedule = (date: string, time: Date) => {
    const now = getValues("schedule");
    const newItem = new Date(date);
    newItem.setHours(time.getHours());
    newItem.setMinutes(time.getMinutes());
    newItem.setSeconds(0);
    const isDuplicate = now[date]?.some(
      (t: Date) => t.getTime() === newItem.getTime()
    );
    if (!isDuplicate) {
      const updated = {
        ...now,
        [date]: [...(now[date] || []), newItem],
      };
      setValue("schedule", updated);
    }
  };

  // スケジュールの削除
  const deleteSchedule = (date: string, time: Date) => {
    const now = getValues("schedule");
    const updated = {
      ...now,
      [date]: now[date].filter((t: Date) => t.getTime() !== time.getTime()),
    };
    setValue("schedule", updated);
  };

  // シートグループの追加
  const addSeatGroup = () => {
    const seatDict = { ...watchSeatDict };
    const newId =
      Object.keys(seatDict).length === 0
        ? 0
        : Math.max(...Object.keys(seatDict).map((id) => parseInt(id))) + 1;
    seatDict[newId] = {
      seatGroup: { capacity: 0 },
      ticketTypes: [{ type_name: "S席", price: 0 }],
    };
    setValue("seatDict", seatDict);
  };

  // シートグループの削除
  const deleteSeatGroup = (id: number) => {
    const newSeatDict = { ...watchSeatDict };
    delete newSeatDict[id];
    setValue("seatDict", newSeatDict);
  };

  // 確認画面へ遷移
  const onSubmit = (data: Record<string, any>) => {
    console.log(data);
  };

  return (
    <Container>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            新規イベント作成
          </Typography>
          <Card sx={{ p: 2 }}>
            <ValidatedForm name="title" label="イベント名" fieldType="title" />
            <ValidatedForm
              name="description"
              label="詳細"
              fieldType="description"
              sx={{
                mt: 2,
              }}
            />
          </Card>
          <Typography variant="body1" margin={2}>
            ステージ時間選択
          </Typography>
          <Card sx={{ px: 2, pb: 1 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <ValidatedDatePicker
                  name="startDate"
                  label="開始日"
                  minDate={new Date()}
                  maxDate={addTime(new Date(), { years: 1 })}
                />
              </Grid>
              <Grid size={6}>
                <ValidatedDatePicker
                  name="endDate"
                  label="終了日"
                  minDate={watchStartDate ? watchStartDate : new Date()}
                  maxDate={
                    watchStartDate
                      ? addTime(watchStartDate, { months: 3 })
                      : addTime(new Date(), { years: 1 })
                  }
                />
              </Grid>
            </Grid>
            {eventDates.map((date: Date) => (
              <Box key={date.getTime()}>
                <Typography variant="subtitle1">
                  {toJST(date, "fullDate")}
                </Typography>
                {watchSchedule[toJST(date, "fullDate")] &&
                  watchSchedule[toJST(date, "fullDate")]
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((time: Date) => (
                      <Chip
                        key={time.getTime()}
                        label={toJST(time, "time")}
                        variant="outlined"
                        color="primary"
                        onDelete={() =>
                          deleteSchedule(toJST(date, "fullDate"), time)
                        }
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                <ValidatedTimePicker
                  name="time"
                  label="時間を追加"
                  date={toJST(date, "fullDate")}
                  addSchedule={addSchedule}
                />
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Card>
          <Typography variant="body1" margin={2}>
            チケット情報入力
          </Typography>
          {Object.entries(watchSeatDict).map(([id, seatDict]) => (
            <CreateSeatGroup
              key={id}
              id={parseInt(id)}
              seatGroup={seatDict.seatGroup}
              ticketTypes={seatDict.ticketTypes}
              onUpdate={(newSeatGroup, newTicketTypes) => {
                const newSeatDict = { ...watchSeatDict };
                newSeatDict[parseInt(id)] = {
                  seatGroup: newSeatGroup,
                  ticketTypes: newTicketTypes,
                };
                setValue("seatDict", newSeatDict);
              }}
              onDelete={() => deleteSeatGroup(parseInt(id))}
            />
          ))}
          <Button
            onClick={addSeatGroup}
            startIcon={<Add />}
            variant="contained"
            sx={{ mt: 2 }}
          >
            特別席追加（座席数独立）
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => setIsConfirmOpen(true)}
          >
            確認
          </Button>
          <Card
            sx={{
              px: 2,
              py: 1,
              backgroundColor: "#f4f4f4",
              textAlign: "left",
            }}
          >
            <Typography variant="body2">startDate:</Typography>
            <pre>{JSON.stringify(watchStartDate, null, 2)}</pre>
            <Typography variant="body2">endDate:</Typography>
            <pre>{JSON.stringify(watchEndDate, null, 2)}</pre>
            <Typography variant="body2">schedule:</Typography>
            <pre>{JSON.stringify(watchSchedule, null, 2)}</pre>
            <Typography variant="body2">seatDict:</Typography>
            <pre>{JSON.stringify(watchSeatDict, null, 2)}</pre>
          </Card>
        </form>
        <ConfirmEvent
          title={getValues("title")}
          description={getValues("description")}
          schedule={watchSchedule}
          seatDict={watchSeatDict}
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false);
            methods.reset();
          }}
        />
      </FormProvider>
    </Container>
  );
};

export default CreateEvent;
