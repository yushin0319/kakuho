// app/src/components/ManageItem.tsx
import { useState } from "react";
import { ReservationDetail } from "../context/ReservationContext";
import ReservationChange from "./ReservationChange";
import ReservationDelete from "./ReservationDelete";
import PaidStatusController from "./PaidStatusController";
import "../assets/styles/ManageItem.scss";

interface ManageListItemProps {
  data: ReservationDetail;
}

const ManageListItem = ({ data }: ManageListItemProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handleChanging = () => {
    setIsChanging(true);
  };

  const handleDeleting = () => {
    setIsDeleting(true);
  };

  const handlePaying = () => {
    setIsPaying(true);
  };

  return (
    <div key={data.reservation.id} className="reservation">
      <button className="paid-btn" onClick={handlePaying}>
        {data.reservation.is_paid ? "✓" : "☐"}
      </button>
      <div
        className={`reservation-data ${data.reservation.is_paid ? "paid" : ""}`}
      >
        <div className="name">{data.user.nickname || data.user.email}</div>
        <div className="type-name">{data.ticketType.type_name}</div>
        <div className="num-attendees">{data.reservation.num_attendees}枚</div>
        <div className="total">
          {data.reservation.num_attendees * data.ticketType.price}円
        </div>
      </div>
      <div className="buttons">
        <button className="change-btn" onClick={handleChanging}>
          変更
        </button>
        <button className="delete-btn" onClick={handleDeleting}>
          削除
        </button>
      </div>
      {isChanging && (
        <ReservationChange
          reservation={data.reservation}
          event={data.event}
          stage={data.stage}
          seatGroup={data.seatGroup}
          ticketType={data.ticketType}
          onClose={() => setIsChanging(false)}
        />
      )}
      {isDeleting && (
        <ReservationDelete
          reservation={data.reservation}
          onClose={() => setIsDeleting(false)}
        />
      )}
      {isPaying && (
        <PaidStatusController
          reservationId={data.reservation.id}
          onClose={() => setIsPaying(false)}
        />
      )}
    </div>
  );
};

export default ManageListItem;
