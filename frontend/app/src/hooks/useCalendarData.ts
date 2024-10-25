// app/src/hooks/useCalendarData.ts
import { useState, useEffect } from "react";
import { fetchEventStages } from "../services/api/stage";
import { StageResponse } from "../services/interfaces";

const useCalendarData = (eventId: number) => {
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        const fetchedStages = await fetchEventStages(eventId);
        setStages(fetchedStages);
        if (fetchedStages.length > 0) {
          setDefaultDate(new Date(fetchedStages[0].start_time));
        }
      } catch (err) {
        setError("Failed to load stages.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarData();
  }, [eventId]);

  return { stages, defaultDate, isLoading, error };
};

export default useCalendarData;
