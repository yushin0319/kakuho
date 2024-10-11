import React from "react";

interface Stage {
  id: number;
  date: string;
  time: string;
}

interface StageListProps {
  stages: Stage[];
}

const StageList: React.FC<StageListProps> = ({ stages }) => {
  return (
    <ul className="stage-list">
      {stages.map((stage) => (
        <li key={stage.id}>
          <span>
            {new Date(stage.date).toLocaleDateString()} - {stage.time}
          </span>
          <button>Select Stage</button>
        </li>
      ))}
    </ul>
  );
};

export default StageList;
