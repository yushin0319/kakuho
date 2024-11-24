// app/src/components/ManageStage.tsx
import { useState, useEffect } from "react";
import { StageResponse, SeatGroupResponse } from "../services/interfaces";
import { fetchStageSeatGroups } from "../services/api/seatGroup";
import ManageListSeatGroup from "./ManageListSeatGroup";
import ScannerModal from "./ScannerModal";
import { toJST } from "../services/utils";
import { useReservationContext } from "../context/ReservationContext";

interface ManageListStageProps {
  stage: StageResponse;
  isOpen: boolean;
  toggle: () => void;
}

const ManageListStage = ({ stage, isOpen, toggle }: ManageListStageProps) => {
  const [seatGroups, setSeatGroups] = useState<SeatGroupResponse[]>([]);
  const [openSeatGroupIds, setOpenSeatGroupIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { reservations } = useReservationContext();

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
  }, [stage.id, reservations]);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div key={stage.id} className="stage">
        <div className="stage-header" onClick={toggle}>
          {isOpen ? "−" : "+"}
          {toJST(stage.start_time, "dateTime")}
          <button
            className="qr-button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal();
            }}
          >
            QRコード受付
          </button>
          {isModalOpen && (
            <ScannerModal stageId={stage.id} onClose={handleCloseModal} />
          )}
        </div>

        <div className={`seat-groups ${isOpen ? "open" : ""}`}>
          {seatGroups.map((group) => (
            <ManageListSeatGroup
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

export default ManageListStage;
