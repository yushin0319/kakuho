// app/src/hooks/useTicketData.ts
import { useState, useEffect } from "react";
import { fetchStageTicketTypes } from "../services/api/ticketType";
import { TicketTypeResponse } from "../services/interfaces";

export const useTicketData = (stageId: number) => {
  const [tickets, setTickets] = useState<TicketTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTicketData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchStageTicketTypes(stageId);
        setTickets(response);
      } catch (err) {
        setError("Failed to load ticket data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (stageId) {
      loadTicketData();
    }
  }, [stageId]);

  return { tickets, isLoading, error };
};
