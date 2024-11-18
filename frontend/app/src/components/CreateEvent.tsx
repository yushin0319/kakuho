// app/src/components/CreateEvent.tsx
import { useState } from "react";
import { Button } from "@mui/material";
import { TicketTypeCreate, SeatGroupCreate } from "../services/interfaces";
import EditStage from "./EditStage";
import EditSeatGroup from "./EditSeatGroup";

export type seatProps = {
  id: number;
  seatGroup: SeatGroupCreate;
  ticketTypes: TicketTypeCreate[];
};

const CreateEvent = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [completedTimes, setCompletedTimes] = useState<Record<string, Date[]>>(
    {}
  );
  const [seatGroups, setSeatGroups] = useState<seatProps[]>([
    {
      id: 0,
      seatGroup: {
        capacity: 0,
      },
      ticketTypes: [{ type_name: "一般", price: 0 }],
    },
  ]);
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
      const newTimes = prev[date].filter((t) => t !== time);
      return { ...prev, [date]: newTimes };
    });
  };

  const handleAddSeatGroup = () => {
    setSeatGroups((prev) => [
      ...prev,
      {
        id: prev.length,
        seatGroup: { capacity: 0 },
        ticketTypes: [],
      },
    ]);
  };

  const handleUpdateSeatGroup = (id: number, updatedGroup: seatProps) => {
    setSeatGroups((prev) =>
      prev.map((sg) =>
        sg.id === id
          ? { ...updatedGroup, ticketTypes: [...updatedGroup.ticketTypes] }
          : sg
      )
    );
  };

  const handleDeleteSeatGroup = (id: number) => {
    setSeatGroups((prev) => prev.filter((sg) => sg.id !== id));
  };

  return (
    <div>
      <h2>ステージ時間選択</h2>
      <EditStage
        startDate={startDate}
        endDate={endDate}
        completedTimes={completedTimes}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        handleComplete={handleComplete}
        handleDelete={handleDelete}
      />
      <h2>チケット情報</h2>
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
      <Button onClick={() => handleAddSeatGroup()}>座席追加</Button>
    </div>
  );
};

export default CreateEvent;
