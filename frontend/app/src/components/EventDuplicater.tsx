import { Box, Button, Typography } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { createEvent } from "../services/api/event";
import { createSeatGroup } from "../services/api/seatGroup";
import { createStage } from "../services/api/stage";
import { createTicketType } from "../services/api/ticketType";
import { EventResponse } from "../services/interfaces";
import { addTime, toJST, toJSTDate } from "../services/utils";
import LoadingScreen from "./LoadingScreen";
import ValidatedDatePicker from "./ValidatedDatePicker";

const EventDuplicater = ({ event }: { event: EventResponse }) => {
  const {
    eventStartDates,
    stages,
    seatGroups,
    ticketTypes,
    reservations,
    reloadData,
    loading,
  } = useAppData();
  const { setSnack } = useSnack();
  const methods = useForm({
    defaultValues: {
      startDate: null,
    },
  });

  const { handleSubmit } = methods;

  const handleDuplicate = handleSubmit(async (data: any) => {
    try {
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0); // 時間部分をリセット
        return normalized;
      };

      const diff =
        Math.floor(
          normalizeDate(toJSTDate(data.startDate)).getTime() /
            (1000 * 60 * 60 * 24)
        ) -
        Math.floor(
          normalizeDate(toJSTDate(eventStartDates[event.id])).getTime() /
            (1000 * 60 * 60 * 24)
        );

      const newEvent = await createEvent({
        name: event.name + "のコピー",
        description: event.description,
      });
      // ステージの複製
      console.log("raw-date", data.startDate);
      console.log("normalizeDate", normalizeDate(data.startDate));
      console.log("eventStartDates", toJSTDate(eventStartDates[event.id]));
      console.log("toJSTDate", toJSTDate(data.startDate));
      console.log("diff", diff);
      const stagePromises = stages
        .filter((stage) => stage.event_id === event.id)
        .map(async (stage) => {
          const newStage = await createStage(newEvent.id, {
            start_time: toJST(
              addTime(new Date(stage.start_time + "Z"), {
                days: diff,
              }),
              "ISO8601"
            ),
            end_time: toJST(
              addTime(new Date(stage.end_time + "Z"), {
                days: diff,
              }),
              "ISO8601"
            ),
          });

          // シートグループの複製
          const seatGroupPromises = seatGroups
            .filter((sg) => sg.stage_id === stage.id)
            .map(async (seatGroup) => {
              let maxCapacity = seatGroup.capacity;
              reservations
                .filter((res) => res.seatGroup.id === seatGroup.id)
                .forEach((res) => {
                  maxCapacity += res.reservation.num_attendees;
                });

              const newSeatGroup = await createSeatGroup(newStage.id, {
                capacity: maxCapacity,
              });

              // チケットタイプの複製
              const ticketTypePromises = ticketTypes
                .filter((tt) => tt.seat_group_id === seatGroup.id)
                .map((ticketType) =>
                  createTicketType(newSeatGroup.id, {
                    type_name: ticketType.type_name,
                    price: ticketType.price,
                  })
                );

              await Promise.all(ticketTypePromises); // チケットタイプを並列に処理
            });

          await Promise.all(seatGroupPromises); // シートグループを並列に処理
        });

      await Promise.all(stagePromises); // ステージを並列に処理

      reloadData();
      setSnack({ message: "イベントを複製しました", severity: "success" });
    } catch (e) {
      console.error(e);
      setSnack({ message: "複製中にエラーが発生しました", severity: "error" });
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleDuplicate}>
        {loading && <LoadingScreen />}
        <Typography variant="body2" sx={{ mb: 2 }}>
          イベントの複製
        </Typography>
        <Typography variant="caption" color="text.secondary">
          開始日を指定してイベントを複製します。
        </Typography>
        <Box display="flex" flexDirection="column" sx={{ mb: 2 }}>
          <ValidatedDatePicker
            name="startDate"
            label="開始日"
            minDate={new Date()}
            maxDate={addTime(new Date(), { years: 1 })}
          />
          <Button variant="contained" color="primary" type="submit">
            複製
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EventDuplicater;
