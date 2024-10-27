// TicketPopup.tsx
import { useState } from "react";
import TicketList from "./TicketList";
import TicketQuantity from "./TicketQuantity";
import TicketSummary from "./TicketSummary";
import { useStageData } from "../hooks/useStageData";
import { TicketTypeResponse } from "../services/interfaces"; // 型のインポート
import "../assets/styles/TicketPopup.scss";

interface TicketPopupProps {
  stageId: number;
  onClose: () => void;
}

const TicketPopup: React.FC<TicketPopupProps> = ({ stageId, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketTypeResponse | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { stage, isLoading } = useStageData(stageId); // ステージの詳細データを取得

  const handleCancel = () => {
    onClose();
  };

  if (isLoading || !stage) return <div>Loading...</div>;

  return (
    <div className="popup">
      {currentStep === 1 && (
        <TicketList
          stage={stage}
          onSelectTicket={(ticket) => {
            setSelectedTicket(ticket);
            setCurrentStep(2);
          }}
          onCancel={handleCancel}
        />
      )}
      {currentStep === 2 && selectedTicket && (
        <TicketQuantity
          stage={stage}
          ticket={selectedTicket}
          quantity={quantity}
          setQuantity={setQuantity}
          onConfirm={() => setCurrentStep(3)}
          onCancel={handleCancel}
        />
      )}
      {currentStep === 3 && selectedTicket && (
        <TicketSummary
          stage={stage}
          ticket={selectedTicket}
          quantity={quantity}
          onConfirm={() => {
            // Reservation 作成のフックを使用
            console.log("Reservation confirmed!");
            handleCancel();
          }}
          onCancel={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
};

export default TicketPopup;
