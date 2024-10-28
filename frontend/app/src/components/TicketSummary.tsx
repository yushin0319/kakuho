// TicketSummary.tsx
import React from "react";
import { useReservation } from "../hooks/useReservation";
import { StageResponse, TicketTypeResponse } from "../services/interfaces";
import "../assets/styles/TicketSummary.scss";

interface TicketSummaryProps {
  stage: StageResponse;
  ticket: TicketTypeResponse;
  quantity: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({
  stage,
  ticket,
  quantity,
  onConfirm,
  onCancel,
}) => {
  const { makeReservation } = useReservation(); // 予約の作成用フック

  const handleConfirm = () => {
    makeReservation(ticket.id, {
      num_attendees: quantity,
    });
    onConfirm();
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
