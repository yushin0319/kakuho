// app/src/components/ManageItem.tsx
import { useState } from "react";
import { ReservationDetail } from "../context/ReservationContext";
import ReservationChange from "./ReservationChange";
import ReservationDelete from "./ReservationDelete";
import "../assets/styles/ManageItem.scss";

interface ManageItemProps {
  data: ReservationDetail;
}

const ManageItem = ({ data }: ManageItemProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChanging = () => {
    setIsChanging(true);
  };

  const handleDeleting = () => {
    setIsDeleting(true);
  };

  return (
    <div key={data.reservation.id} className="reservation">
      {data.ticketType.type_name} {data.reservation.num_attendees}枚{" "}
      {data.reservation.num_attendees * data.ticketType.price}円{" "}
      {data.user.nickname || data.user.email}
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
    </div>
  );
};

export default ManageItem;
