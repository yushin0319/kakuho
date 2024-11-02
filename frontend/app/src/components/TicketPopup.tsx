// app/src/components/TicketPopup.tsx
import { useState, useEffect } from "react";
import TicketList from "./TicketList";
import TicketQuantity from "./TicketQuantity";
import TicketSummary from "./TicketSummary";
import Modal from "./Modal";
import { fetchStage } from "../services/api/stage";
import {
  TicketTypeResponse,
  EventResponse,
  StageResponse,
} from "../services/interfaces";

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
  const [stage, setStage] = useState<StageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStage = async () => {
      try {
        const response = await fetchStage(stageId);
        setStage(response);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStage();
  }, [stageId]);

  const handleCancel = () => {
    onClose();
  };

  if (isLoading) {
    return <Modal onClose={handleCancel}>Loading...</Modal>;
  }

  if (!stage) {
    return <Modal onClose={handleCancel}>Stage not found.</Modal>;
  }

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
