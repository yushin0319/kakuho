// app/src/hooks/useDeleteReservation.ts
import { useState } from "react";
import { deleteReservation } from "../services/api/reservation";

export const useDeleteReservation = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const removeReservation = async (id: number): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await deleteReservation(id);
      return true;
    } catch (error) {
      setDeleteError("Failed to delete the reservation.");
      console.error(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { removeReservation, isDeleting, deleteError };
};
