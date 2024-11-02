// app/src/components/ReservationDelete.tsx
import Modal from "./Modal";
import { deleteReservation } from "../services/api/reservation";
import { ReservationResponse } from "../services/interfaces";
import { useReservationContext } from "../context/ReservationContext";

interface ReservationDeleteProps {
  reservation: ReservationResponse;
  onClose: () => void;
}

const ReservationDelete = ({
  reservation,
  onClose,
}: ReservationDeleteProps) => {
  const { reloadReservations } = useReservationContext();

  const handleDeleteConfirm = async () => {
    try {
      await deleteReservation(reservation.id);
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    } finally {
      reloadReservations();
      onClose();
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-content">
        <h3>予約を削除しますか？</h3>
        <p>この操作は取り消せません。</p>
        <div className="button-group">
          <button className="confirm-btn" onClick={handleDeleteConfirm}>
            削除する
          </button>
          <button className="cancel-btn" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationDelete;
