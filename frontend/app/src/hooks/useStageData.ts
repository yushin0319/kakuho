// useStageData.ts
import { useState, useEffect } from "react";
import { fetchStage } from "../services/api/stage";
import { StageResponse } from "../services/interfaces";

export const useStageData = (stageId: number) => {
  const [stage, setStage] = useState<StageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchStage(stageId);
        setStage(response);
      } catch (err) {
        setError("Failed to load stage details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (stageId) {
      loadStageData();
    }
  }, [stageId]);

  return { stage, isLoading, error };
};
