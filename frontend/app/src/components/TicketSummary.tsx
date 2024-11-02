// app/src/components/TicketSummary.tsx
import { createReservation } from "../services/api/reservation";
import {
  StageResponse,
  TicketTypeResponse,
  ReservationCreate,
} from "../services/interfaces";
import { useReservationContext } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";
import "../assets/styles/TicketSummary.scss";

interface TicketSummaryProps {
  stage: StageResponse;
  ticket: TicketTypeResponse;
  quantity: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const TicketSummary = ({
  stage,
  ticket,
  quantity,
  onConfirm,
  onCancel,
}: TicketSummaryProps) => {
  const { reloadReservations } = useReservationContext();
  const { addNewItem } = useNewItemContext();

  const handleConfirm = async () => {
    try {
      const data: ReservationCreate = {
        num_attendees: quantity,
      };
      const newItem = await createReservation(ticket.id, data);
      addNewItem(newItem.id);
    } catch (error) {
      console.error("Failed to create reservation:", error);
    } finally {
      console.log("createReservation");
      reloadReservations();
      onConfirm();
    }
  };

  return (
    <div>
      <h3>
        {new Date(stage.start_time).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h3>
      <p>
        {ticket.type_name} - {quantity} 枚 - 合計 {ticket.price * quantity}円
      </p>
      <p>予約します。よろしいですか？</p>
      <button onClick={handleConfirm}>OK</button>
      <button onClick={onCancel}>キャンセル</button>
    </div>
  );
};

export default TicketSummary;
