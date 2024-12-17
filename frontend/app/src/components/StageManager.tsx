import { Box, Chip, Divider, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAppData } from "../context/AppData";
import { useSnack } from "../context/SnackContext";
import { createSeatGroup, deleteSeatGroup } from "../services/api/seatGroup";
import { createStage, deleteStage } from "../services/api/stage";
import { createTicketType, deleteTicketType } from "../services/api/ticketType";
import {
  EventResponse,
  SeatGroupResponse,
  StageCreate,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { addTime, toJST } from "../services/utils";
import SeatGroupSelector from "./SeatGroupSelector";
import ValidatedDatePicker from "./ValidatedDatePicker";
import ValidatedTimePicker from "./ValidatedTimePicker";

const StageManager = ({ event }: { event: EventResponse }) => {
  const { stages, seatGroups, ticketTypes, reservations, reloadData } =
    useAppData();
  const methods = useForm({
    defaultValues: {
      stageDate: null,
      stageTime: null,
    },
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const { setSnack } = useSnack();

  const [open, setOpen] = useState(false);

  const filteredStages = useMemo(
    () => stages.filter((stage) => stage.event_id === event.id),
    [stages, event.id]
  );

  const hasReservations = useMemo(() => {
    const dict: Record<number, boolean> = {};
    filteredStages.forEach((stage) => {
      dict[stage.id] = reservations.some((r) => r.stage.id === stage.id);
    });
    return dict;
  }, [filteredStages, reservations]);

  const stagesByDate = useMemo(() => {
    const dict: Record<string, StageResponse[]> = {};
    filteredStages.forEach((stage) => {
      const date = toJST(stage.start_time, "fullDate");
      if (!dict[date]) {
        dict[date] = [];
      }
      dict[date].push(stage);
    });
    return dict;
  }, [filteredStages]);

  // ステージごとのチケットタイプを辞書化
  const seatDict = useMemo(() => {
    const dict: Record<
      string,
      { seatGroup: SeatGroupResponse; ticketTypes: TicketTypeResponse[] }[]
    > = {};

    filteredStages.forEach((stage) => {
      const stageKey: string[] = [];
      const stageDict: {
        seatGroup: SeatGroupResponse;
        ticketTypes: TicketTypeResponse[];
      }[] = [];
      const seatGroupsForStage = seatGroups.filter(
        (sg) => sg.stage_id === stage.id
      );
      seatGroupsForStage.forEach((sg) => {
        const ticketTypesForSeatGroup = ticketTypes
          .filter((tt) => tt.seat_group_id === sg.id)
          .sort((a, b) => a.type_name.localeCompare(b.type_name));
        stageDict.push({ seatGroup: sg, ticketTypes: ticketTypesForSeatGroup });

        const groupKey = JSON.stringify(
          ticketTypesForSeatGroup.map((tt) => tt.type_name + tt.price).join(",")
        );

        stageKey.push(groupKey);
      });
      stageKey.sort();
      const key = JSON.stringify(stageKey);
      if (!dict[key]) {
        dict[key] = stageDict;
      }
    });
    return dict;
  }, [seatGroups, ticketTypes]);

  // ステージのパターンが複数ある場合は選択画面を表示
  const checkDict = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }
    const keys = Object.keys(seatDict);
    if (keys.length > 1) {
      setOpen(true);
    } else {
      addStage(keys[0]);
    }
  };

  // ステージ作成
  const addStage = async (key: string) => {
    const startDateTime = new Date(
      selectedDate!.getFullYear(),
      selectedDate!.getMonth(),
      selectedDate!.getDate(),
      selectedTime!.getHours(),
      selectedTime!.getMinutes()
    );
    // 重複チェック
    const exists = stages.some(
      (stage) =>
        new Date(stage.start_time).getTime() === startDateTime.getTime()
    );
    if (exists) {
      setSnack({
        message: "同じ時間帯のステージが既に存在します",
        severity: "error",
      });
      return;
    }

    // ステージ作成API呼び出し
    const newStage = await createStage(event.id, {
      start_time: toJST(startDateTime, "ISO8601"),
      end_time: toJST(addTime(startDateTime, { hours: 2 }), "ISO8601"),
    } as StageCreate);

    const selectedSeatGroup = seatDict[key];
    for (const group of selectedSeatGroup) {
      const newSeatGroup = await createSeatGroup(newStage.id, {
        capacity: group.seatGroup.capacity,
      });
      for (const ticketType of group.ticketTypes) {
        await createTicketType(newSeatGroup.id, {
          type_name: ticketType.type_name,
          price: ticketType.price,
        });
      }
    }

    reloadData();
    setSnack({ message: "ステージを追加しました", severity: "success" });
  };

  // ステージ削除
  const removeStage = async (id: number) => {
    const seatGroupsForStage = seatGroups.filter((sg) => sg.stage_id === id);
    const ticketTypesForStage = ticketTypes.filter((tt) =>
      seatGroupsForStage.some((sg) => sg.id === tt.seat_group_id)
    );
    await Promise.all(ticketTypesForStage.map((tt) => deleteTicketType(tt.id)));
    await Promise.all(seatGroupsForStage.map((sg) => deleteSeatGroup(sg.id)));
    await deleteStage(id);
    reloadData();
    setSnack({ message: "ステージを削除しました", severity: "success" });
  };

  return (
    <FormProvider {...methods}>
      <Box display="flex" flexDirection="column">
        <Typography variant="body2" sx={{ mb: 2 }}>
          ステージ編集
        </Typography>
        <Typography variant="caption" color="text.secondary">
          予約の存在するステージは削除できません。
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          予約管理画面からキャンセルしてください。
        </Typography>

        {/* ステージ表示 */}
        {Object.keys(stagesByDate)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date) => (
            <Box
              key={date}
              sx={{ mb: 1 }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2">
                {toJST(date, "monthDate")}
              </Typography>
              <Box>
                {stagesByDate[date]
                  .sort(
                    (a, b) =>
                      new Date(a.start_time).getTime() -
                      new Date(b.start_time).getTime()
                  )
                  .map((stage) => (
                    <Chip
                      key={stage.id}
                      label={toJST(stage.start_time, "time")}
                      onDelete={
                        hasReservations[stage.id]
                          ? undefined
                          : () => removeStage(stage.id)
                      }
                      disabled={hasReservations[stage.id]}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
              </Box>
            </Box>
          ))}

        <Divider sx={{ my: 2 }} />

        {/* 新規ステージ追加 */}
        <Box display="flex" flexDirection="column" gap={1} alignItems="center">
          <Typography variant="h6">新規ステージ追加</Typography>
          <ValidatedDatePicker
            name="stageDate"
            label="ステージ日付"
            minDate={new Date()}
            onDateChange={(value) => setSelectedDate(value)}
          />
          <ValidatedTimePicker
            date={selectedDate ? selectedDate.toISOString() : ""}
            label="ステージ時間"
            addSchedule={(_, time) => {
              setSelectedTime(time);
              checkDict();
            }}
          />
        </Box>
      </Box>

      <SeatGroupSelector
        open={open}
        onClose={() => setOpen(false)}
        seatDict={seatDict}
        onSelect={(key) => {
          setOpen(false);
          addStage(key);
        }}
      />
    </FormProvider>
  );
};

export default StageManager;
