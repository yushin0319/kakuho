// app/src/components/PaidStatusController.tsx
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { updateReservation } from "../services/api/reservation";
import { toJST } from "../services/utils";
import {
  useReservationContext,
  ReservationDetail,
} from "../context/ReservationContext";

interface PaidStatusControllerProps {
  reservationId: number;
  onClose: () => void;
}

const PaidStatusController = ({
  reservationId,
  onClose,
}: PaidStatusControllerProps) => {
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationDetail | null>(
    null
  );
  const { simpleReload, reservations } = useReservationContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    const reservation = reservations.find(
      (res) => res.reservation.id === reservationId
    );
    if (reservation) {
      setReservation(reservation);
      setIsPaid(reservation.reservation.is_paid);
    }
    setIsLoading(false);
  }, [reservations, reservationId]);

  const handleChangePaidStatus = async () => {
    if (!reservation) return;
    try {
      const data = {
        user_id: reservation.user.id,
        is_paid: !isPaid,
      };
      await updateReservation(reservation.reservation.id, data);
    } catch (error: any) {
      console.error(error);
    } finally {
      simpleReload();
      onClose();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!reservation) {
    return <div>Reservation not found</div>;
  }

  return (
    <Modal onClose={onClose}>
      <div className="paid-status-content">
        <h2>ご予約詳細</h2>
        {reservation.user.nickname && (
          <p>ご予約名: {reservation.user.nickname}</p>
        )}
        <p>イベント名：{reservation.event.name}</p>
        <p>開始時間：{toJST(reservation.stage.start_time, "dateTime")}</p>
        <p>
          チケット種別：{reservation.ticketType.type_name}
          {" - "}
          {reservation.ticketType.price}円
        </p>
        <p>ご人数：{reservation.reservation.num_attendees}名様</p>
        <p>
          お支払い金額：
          {reservation.ticketType.price * reservation.reservation.num_attendees}
          円
        </p>

        <button onClick={handleChangePaidStatus}>
          {isPaid ? "受付取消" : "受付完了"}
        </button>
        <button onClick={onClose}>キャンセル</button>
      </div>
    </Modal>
  );
};

export default PaidStatusController;
