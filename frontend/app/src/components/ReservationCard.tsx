import { useState } from "react";
import "../assets/styles/ReservationCard.scss";
import {
  ReservationResponse,
  EventResponse,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { useDeleteReservation } from "../hooks/useDeleteReservation";
import { getDate, getHour } from "../services/utils";
import ReservationChange from "./ReservationChange";
import { useReservationContext } from "../context/ReservationContext";

interface ReservationCardProps {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  ticketType: TicketTypeResponse;
  isExpanded: boolean;
  onCardClick: () => void;
}

const ReservationCard = ({
  reservation,
  event,
  stage,
  ticketType,
  isExpanded,
  onCardClick,
}: ReservationCardProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const { removeReservation } = useDeleteReservation();
  const { reloadReservations } = useReservationContext();

  const handleCardClick = () => {
    onCardClick();
  };

  const handleChangeClick = () => {
    setIsChanging(true);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("この予約を削除しますか？")) {
      await removeReservation(reservation.id);
      reloadReservations(); // 予約削除後にデータを再取得
    }
  };

  return (
    <div className="reservation-card" onClick={handleCardClick}>
      <div className="reservation-info">
        <h3>{event.name}</h3>
        <p>
          日時: {getDate(new Date(stage.start_time))}{" "}
          {getHour(new Date(stage.start_time))}
        </p>
      </div>
      {isExpanded && (
        <div className="reservation-details">
          <p>
            ご予約チケット：{ticketType.type_name} {ticketType.price}円
          </p>
          <p>ご予約枚数：{reservation.num_attendees}枚</p>
          <p>合計：{ticketType.price * reservation.num_attendees}円</p>

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
          reservation={reservation}
          event={event}
          stage={stage}
          ticketType={ticketType}
          onClose={() => {
            setIsChanging(false);
            reloadReservations(); // 予約変更後にデータを再取得
          }}
        />
      )}
    </div>
  );
};

export default ReservationCard;
