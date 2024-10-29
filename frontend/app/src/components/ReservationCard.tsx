// app/src/components/ReservationCard.tsx
import React, { useState } from "react";
import "../assets/styles/ReservationCard.scss";
import {
  ReservationResponse,
  EventResponse,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { useChangeReservation } from "../hooks/useChangeReservation";
import { useDeleteReservation } from "../hooks/useDeleteReservation";
import { getDate } from "../services/utils";

interface ReservationCardProps {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  ticketType: TicketTypeResponse;
}

const ReservationCard = ({
  reservation,
  event,
  stage,
  ticketType,
}: ReservationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const { changeReservation } = useChangeReservation();
  const { removeReservation } = useDeleteReservation();

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleChangeClick = () => {
    setIsChanging(true);
    // モーダルを開くなどの処理を追加予定
  };

  const handleDeleteClick = async () => {
    if (window.confirm("この予約を削除しますか？")) {
      await removeReservation(reservation.id);
    }
  };

  return (
    <div className="reservation-card" onClick={handleCardClick}>
      <div className="reservation-info">
        <h3>{event.name}</h3>
        <p>日時: {getDate(new Date(stage.start_time))}</p>
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
    </div>
  );
};

export default ReservationCard;
