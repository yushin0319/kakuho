// app/src/components/ManageStage.tsx
import { useState, useEffect } from "react";
import { StageResponse, SeatGroupResponse } from "../services/interfaces";
import { fetchStageSeatGroups } from "../services/api/seatGroup";
import ManageSeatGroup from "./ManageSeatGroup";
import { getDate, getHour } from "../services/utils";

interface ManageStageProps {
  stage: StageResponse;
  isOpen: boolean;
  toggle: () => void;
}

const ManageStage = ({ stage, isOpen, toggle }: ManageStageProps) => {
  const [seatGroups, setSeatGroups] = useState<SeatGroupResponse[]>([]);
  const [openSeatGroupIds, setOpenSeatGroupIds] = useState<number[]>([]);

  useEffect(() => {
    const loadSeatGroups = async () => {
      try {
        const seatGroupsData = await fetchStageSeatGroups(stage.id);
        setSeatGroups(seatGroupsData);
      } catch (error) {
        console.error("Failed to load seat groups:", error);
      }
    };

    loadSeatGroups();
  }, [stage.id]);

  useEffect(() => {
    if (!isOpen) {
      setOpenSeatGroupIds([]);
    }
  }, [isOpen]);

  const toggleSeatGroup = (id: number) => {
    if (openSeatGroupIds.includes(id)) {
      setOpenSeatGroupIds(openSeatGroupIds.filter((groupId) => groupId !== id));
    } else {
      setOpenSeatGroupIds([...openSeatGroupIds, id]);
    }
  };

  return (
    <div>
      <div key={stage.id} className="stage">
        <div className="stage-header" onClick={toggle}>
          {isOpen ? "−" : "+"}
          {getDate(new Date(stage.start_time))}{" "}
          {getHour(new Date(stage.start_time))}
        </div>
        <div className={`seat-groups ${isOpen ? "open" : ""}`}>
          {seatGroups.map((group) => (
            <ManageSeatGroup
              key={group.id}
              seatGroup={group}
              isOpen={openSeatGroupIds.includes(group.id)}
              toggle={() => toggleSeatGroup(group.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageStage;
