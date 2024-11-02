// app/src/components/TicketList.tsx
import { useState, useEffect } from "react";
import { fetchStageTicketTypes } from "../services/api/ticketType";
import { StageResponse, TicketTypeResponse } from "../services/interfaces";
import "../assets/styles/TicketList.scss";

interface TicketListProps {
  stage: StageResponse;
  onSelectTicket: (ticket: TicketTypeResponse) => void;
  onCancel: () => void;
}

const TicketList = ({ stage, onSelectTicket, onCancel }: TicketListProps) => {
  const [tickets, setTickets] = useState<TicketTypeResponse[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await fetchStageTicketTypes(stage.id);
        setTickets(response);
      } catch (err) {
        console.error(err);
      }
    };

    loadTickets();
  }, [stage.id]);

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
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          disabled={ticket.available <= 0}
          onClick={() => onSelectTicket(ticket)}
        >
          {ticket.type_name} - {ticket.price}円 ({ticket.available} 枚)
        </button>
      ))}
      <button onClick={onCancel}>キャンセル</button>
    </div>
  );
};

export default TicketList;
