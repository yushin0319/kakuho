// app/src/components/ReservationCard.tsx
import { useEffect, useState } from "react";
import { toJST } from "../services/utils";
import ReservationChange from "./ReservationChange";
import ReservationDelete from "./ReservationDelete";
import { ReservationDetail } from "../context/ReservationContext";
import { QRCodeSVG } from "qrcode.react";
import "../assets/styles/ReservationCard.scss";

interface ReservationCardProps {
  reservationDetail: ReservationDetail;
  isExpanded: boolean;
  isNew: boolean;
  onCardClick: () => void;
}

const ReservationCard = ({
  reservationDetail: { reservation, event, stage, seatGroup, ticketType, user },
  isExpanded,
  isNew,
  onCardClick,
}: ReservationCardProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  useEffect(() => {
    if (isNew) {
      setIsNewItem(true);
    }
  });

  const handleCardClick = () => {
    onCardClick();
  };

  const handleChangeClick = () => {
    setIsChanging(true);
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  return (
    <div
      className={`reservation-card ${isNewItem ? "highlight" : ""}`}
      onClick={handleCardClick}
    >
      <div className="reservation-info">
        <h3>{event.name}</h3>
        <p>日時: {toJST(stage.start_time, "dateTime")}</p>
      </div>
      {isExpanded && (
        <div className="reservation-details">
          <p>
            ご予約チケット：{ticketType.type_name} {ticketType.price}円
          </p>
          <p>ご予約枚数：{reservation.num_attendees}枚</p>
          <p>合計：{ticketType.price * reservation.num_attendees}円</p>
          <div className="qr-code">
            <QRCodeSVG value={`Kakuho-${reservation.id}`} size={128} />
          </div>

          <div className="buttons">
            <button className="change-btn" onClick={handleChangeClick}>
              変更
            </button>
            <button className="delete-btn" onClick={handleDeleteClick}>
              削除
            </button>
          </div>
        </div>
      )}
      {isChanging && (
        <ReservationChange
          reservationDetail={{
            reservation,
            event,
            stage,
            seatGroup,
            ticketType,
            user,
          }}
          onClose={() => {
            setIsChanging(false);
          }}
        />
      )}
      {isDeleting && (
        <ReservationDelete
          reservation={reservation}
          onClose={() => setIsDeleting(false)} // モーダルを閉じる
        />
      )}
    </div>
  );
};

export default ReservationCard;
