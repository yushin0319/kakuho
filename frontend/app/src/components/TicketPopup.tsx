// app/src/components/TicketPopup.tsx
import { useState } from "react";
import TicketList from "./TicketList";
import TicketQuantity from "./TicketQuantity";
import TicketSummary from "./TicketSummary";
import Modal from "./Modal";
import { useStageData } from "../hooks/useStageData";
import { TicketTypeResponse, EventResponse } from "../services/interfaces";

interface TicketPopupProps {
  stageId: number;
  event: EventResponse;
  onClose: () => void;
}

const TicketPopup = ({ stageId, event, onClose }: TicketPopupProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketTypeResponse | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { stage, isLoading } = useStageData(stageId);

  const handleCancel = () => {
    onClose();
  };

  if (isLoading || !stage) return <div>Loading...</div>;

  return (
    <Modal onClose={handleCancel}>
      <h3>{event.name}</h3>
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
            console.log("Reservation confirmed!");
            handleCancel();
          }}
          onCancel={() => setCurrentStep(2)}
        />
      )}
    </Modal>
  );
};

export default TicketPopup;
