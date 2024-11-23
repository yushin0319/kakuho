// app/src/components/TicketList.tsx
import { useState, useEffect } from "react";
import { fetchStageSeatGroups, getCapacity } from "../services/api/seatGroup";
import { fetchSeatGroupTicketTypes } from "../services/api/ticketType";
import { StageResponse, TicketTypeResponse } from "../services/interfaces";
import { toJST } from "../services/utils";
import "../assets/styles/TicketList.scss";

interface TicketListProps {
  stage: StageResponse;
  onSelectTicket: (ticket: TicketTypeResponse) => void;
  onCancel: () => void;
}

const TicketList = ({ stage, onSelectTicket, onCancel }: TicketListProps) => {
  const [tickets, setTickets] = useState<TicketTypeResponse[]>([]);
  const [capacities, setCapacities] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const seatGroups = await fetchStageSeatGroups(stage.id);
        const ticketTypes: TicketTypeResponse[] = [];
        const capacities: Record<number, number> = {};
        for (const seatGroup of seatGroups) {
          const types = await fetchSeatGroupTicketTypes(seatGroup.id);
          ticketTypes.push(...types);
        }
        for (const ticket of ticketTypes) {
          capacities[ticket.id] = await getCapacity(ticket.id);
        }
        setTickets(ticketTypes);
        setCapacities(capacities);
      } catch (err) {
        console.error(err);
      }
    };

    loadTickets();
  }, [stage.id]);

  return (
    <div>
      <h3>{toJST(stage.start_time, "dateTime")}</h3>
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          disabled={capacities[ticket.id] === 0}
          onClick={() => onSelectTicket(ticket)}
        >
          {ticket.type_name} - {ticket.price}円
        </button>
      ))}
      <button onClick={onCancel}>キャンセル</button>
    </div>
  );
};

export default TicketList;
