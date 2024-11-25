// app/src/components/CreateEvent.tsx
import { useState, useEffect } from "react";
import { Button, Card, TextField, Box, Typography } from "@mui/material";
import { TicketTypeCreate, SeatGroupCreate } from "../services/interfaces";
import EditStage from "./EditStage";
import EditSeatGroup from "./EditSeatGroup";
import ConfirmEvent from "./ConfirmEvent";

export type seatProps = {
  id: number;
  seatGroup: SeatGroupCreate;
  ticketTypes: TicketTypeCreate[];
};

const initialize = () => {
  try {
    const data = localStorage.getItem("createEventData");
    if (data) {
      const parsedData = JSON.parse(data);
      return {
        completedTimes: Object.fromEntries(
          Object.entries(parsedData.completedTimes || {}).map(
            ([key, times]) => [
              key,
              (times as string[]).map((time: string) => new Date(time)), // 配列内の文字列をDateオブジェクトに変換
            ]
          )
        ),
        seatGroups: parsedData.seatGroups as seatProps[] | [],
        startDate: parsedData.startDate ? new Date(parsedData.startDate) : null,
        endDate: parsedData.endDate ? new Date(parsedData.endDate) : null,
        title: parsedData.title,
        description: parsedData.description,
      };
    }
  } catch (e) {
    console.error(e);
  }

  return {
    completedTimes: {},
    seatGroups: [
      {
        id: 0,
        seatGroup: {
          capacity: 0,
        },
        ticketTypes: [{ type_name: "一般", price: 0 }],
      },
    ],
    startDate: null,
    endDate: null,
    title: "",
    description: "",
  };
};

const CreateEvent = () => {
  const {
    completedTimes: initialCompletedTimes,
    seatGroups: initialSeatGroups,
    startDate: initialStartDate,
    endDate: initialEndDate,
    title: initialTitle,
    description: initialDescription,
  } = initialize();
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [completedTimes, setCompletedTimes] = useState<Record<string, Date[]>>(
    initialCompletedTimes
  );
  const [seatGroups, setSeatGroups] = useState<seatProps[]>(initialSeatGroups);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(
      "createEventData",
      JSON.stringify({
        completedTimes,
        seatGroups,
        startDate,
        endDate,
        title,
        description,
      })
    );
  }, [completedTimes, seatGroups, startDate, endDate, title, description]);

  // startDate, endDateの変更時にcompletedTimesのうち、範囲外のデータを削除
  useEffect(() => {
    if (startDate && endDate) {
      const newCompletedTimes: Record<string, Date[]> = {};
      Object.entries(completedTimes).forEach(([date, times]) => {
        if (new Date(date) >= startDate && new Date(date) <= endDate) {
          newCompletedTimes[date] = times;
        }
      });
      setCompletedTimes(newCompletedTimes);
    }
  }, [startDate, endDate]);

  // 決定ボタンの処理
  const handleComplete = (date: string, time: Date) => {
    const existingTimes = completedTimes[date] || [];
    if (existingTimes.some((t) => t.getTime() === time.getTime())) {
      return;
    }
    setCompletedTimes((prev) => {
      const newTimes = prev[date] ? [...prev[date], time] : [time];
      newTimes.sort((a, b) => a.getTime() - b.getTime());
      return { ...prev, [date]: newTimes };
    });
  };

  // 削除ボタンの処理
  const handleDelete = (date: string, time: Date) => {
    setCompletedTimes((prev) => {
      const newTimes = prev[date].filter((t) => t.getTime() !== time.getTime());
      return { ...prev, [date]: newTimes };
    });
  };

  // シートグループの追加
  const handleAddSeatGroup = () => {
    const newId = Math.max(...seatGroups.map((sg) => sg.id)) + 1;
    setSeatGroups((prev) => [
      ...prev,
      {
        id: newId,
        seatGroup: { capacity: 0 },
        ticketTypes: [{ type_name: "S席", price: 0 }],
      },
    ]);
  };

  // シートグループの更新
  const handleUpdateSeatGroup = (id: number, updatedGroup: seatProps) => {
    setSeatGroups((prev) =>
      prev.map((group) => (group.id === id ? updatedGroup : group))
    );
  };

  // シートグループの削除
  const handleDeleteSeatGroup = (id: number) => {
    const newSeatGroups = seatGroups.filter((group) => group.id !== id);
    setSeatGroups(newSeatGroups);
  };

  // デバッグ用
  const info = () => {
    console.log(completedTimes);
    console.log(seatGroups);
  };

  // ConfirmEventの開閉
  const handleClose = () => {
    setOpen(false);
  };

  // リセット
  const handleReset = () => {
    localStorage.removeItem("createEventData");
    window.location.reload();
  };

  return (
    <Box>
      <Typography variant="h5" margin={2}>
        基本情報入力
      </Typography>
      <Card sx={{ p: 4 }}>
        <TextField
          label="イベント名"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          fullWidth
          autoComplete="off"
          margin="normal"
        />
        <TextField
          label="詳細"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
          multiline
          fullWidth
          margin="normal"
        />
      </Card>
      <Typography variant="h5" margin={2}>
        ステージ時間選択
      </Typography>
      <EditStage
        startDate={startDate}
        endDate={endDate}
        completedTimes={completedTimes}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        handleComplete={handleComplete}
        handleDelete={handleDelete}
      />
      <Typography variant="h5" margin={2}>
        チケット情報入力
      </Typography>
      {seatGroups.map((sg) => (
        <EditSeatGroup
          key={sg.id}
          seatGroup={sg}
          onUpdate={(seatGroup) => {
            handleUpdateSeatGroup(sg.id, seatGroup);
          }}
          onDelete={() => handleDeleteSeatGroup(sg.id)}
        />
      ))}
      <Button onClick={() => handleAddSeatGroup()}>特別席追加</Button>
      <Button onClick={info}>情報</Button>
      <Button onClick={() => setOpen(true)}>確認</Button>
      <ConfirmEvent
        title={title}
        description={description}
        completedTimes={completedTimes}
        seatGroups={seatGroups}
        open={open}
        onClose={handleClose}
        onConfirm={handleReset}
      />
    </Box>
  );
};

export default CreateEvent;
