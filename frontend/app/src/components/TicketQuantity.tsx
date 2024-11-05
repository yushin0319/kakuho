// app/src/components/TicketQuantity.tsx
import { useState, useEffect } from "react";
import { getCapacity } from "../services/api/seatGroup";
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

const TicketQuantity = ({
  stage,
  ticket,
  quantity,
  setQuantity,
  onConfirm,
  onCancel,
}: TicketQuantityProps) => {
  const [maxQuantity, setMaxQuantity] = useState(0);

  useEffect(() => {
    const loadCapacity = async () => {
      try {
        const capacity = await getCapacity(ticket.id);
        setMaxQuantity(capacity);
      } catch (err) {
        console.error(err);
      }
    };
    loadCapacity();
  }, [ticket.id]);

  const handleIncrement = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
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
