// TicketQuantity.tsx
import React from "react";
import { StageResponse, TicketTypeResponse } from "../services/interfaces";
import "../assets/styles/TicketQuantity.scss";

interface TicketQuantityProps {
  stage: StageResponse;
  ticket: TicketTypeResponse;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const TicketQuantity: React.FC<TicketQuantityProps> = ({
  stage,
  ticket,
  quantity,
  setQuantity,
  onConfirm,
  onCancel,
}) => {
  const maxQuantity = ticket.available;

  const handleIncrement = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div>
      <h3>{new Date(stage.start_time).toLocaleString()}</h3>
      <p>{ticket.type_name}</p>
      <div>
        <button onClick={handleDecrement}>-</button>
        <span>{quantity}</span>
        <button onClick={handleIncrement}>+</button>
      </div>
      <p>合計: {ticket.price * quantity}円</p>
      <button onClick={onConfirm}>予約する</button>
      <button onClick={onCancel}>キャンセル</button>
    </div>
  );
};

export default TicketQuantity;
