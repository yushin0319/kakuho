// app/src/components/ManageEvent.tsx
import { useState, useEffect } from "react";
import { EventResponse, StageResponse } from "../services/interfaces";
import { fetchEventStages } from "../services/api/stage";
import ManageListStage from "./ManageListStage";

interface ManageListEventProps {
  event: EventResponse;
  isOpen: boolean;
  toggle: () => void;
}

const ManageListEvent = ({ event, isOpen, toggle }: ManageListEventProps) => {
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [openStageIds, setOpenStageIds] = useState<number[]>([]);

  useEffect(() => {
    const loadStages = async () => {
      try {
        const stagesData = await fetchEventStages(event.id);
        setStages(stagesData);
      } catch (error) {
        console.error("Failed to load stages:", error);
      }
    };

    loadStages();
  }, [event.id]);

  useEffect(() => {
    if (!isOpen) {
      setOpenStageIds([]);
    }
  }, [isOpen]);

  const toggleStage = (id: number) => {
    if (openStageIds.includes(id)) {
      setOpenStageIds(openStageIds.filter((stageId) => stageId !== id));
    } else {
      setOpenStageIds([...openStageIds, id]);
    }
  };

  return (
    <div className="manage-list">
      <div key={event.id} className="event">
        <div className="event-header" onClick={toggle}>
          {isOpen ? "−" : "+"} {event.name}
        </div>
        <div className={`stages ${isOpen ? "open" : ""}`}>
          {stages.map((stage) => (
            <ManageListStage
              key={stage.id}
              stage={stage}
              isOpen={openStageIds.includes(stage.id)}
              toggle={() => toggleStage(stage.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageListEvent;
