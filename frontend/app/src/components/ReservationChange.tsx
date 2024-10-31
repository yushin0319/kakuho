import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
  createReservation,
  updateReservation,
  deleteReservation,
} from "../services/api/reservation";
import { fetchEventStages, fetchStage } from "../services/api/stage";
import {
  fetchStageTicketTypes,
  fetchTicketType,
} from "../services/api/ticketType";

import {
  ReservationResponse,
  EventResponse,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import "../assets/styles/ReservationChange.scss";

interface ReservationChangeProps {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  ticketType: TicketTypeResponse;
  onClose: () => void;
}

const ReservationChange = ({
  reservation,
  event,
  stage,
  ticketType,
  onClose,
}: ReservationChangeProps) => {
  const [step, setStep] = useState(1);
  const [newStage, setNewStage] = useState<StageResponse>(stage);
  const [newTicketType, setNewTicketType] =
    useState<TicketTypeResponse>(ticketType);
  const [newNumAttendees, setNewNumAttendees] = useState<number>(
    reservation.num_attendees
  );
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [maxAvailable, setMaxAvailable] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStages = async () => {
      const stages = await fetchEventStages(event.id);
      if (isMounted) {
        setStages(stages);
      }
    };
    loadStages();
    return () => {
      isMounted = false;
    };
  }, [event.id]);

  useEffect(() => {
    let isMounted = true;
    const loadTicketTypes = async () => {
      const ticketTypes = await fetchStageTicketTypes(newStage.id);
      if (isMounted) {
        setTicketTypes(ticketTypes);
      }
    };
    loadTicketTypes();
    return () => {
      isMounted = false;
    };
  }, [newStage.id]);

  useEffect(() => {
    const maxAvailableForSelected =
      newTicketType.id === ticketType.id
        ? newTicketType.available + reservation.num_attendees
        : newTicketType.available;

    setMaxAvailable(maxAvailableForSelected);

    if (newNumAttendees > maxAvailableForSelected) {
      setAlertMessage("選択した券種の最大予約可能数を超えています。");
    } else {
      setAlertMessage(null); // 超えていない場合、メッセージを消す
    }
  }, [newStage, newTicketType]);

  const handleCancel = () => {
    onClose();
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleConfirm = async () => {
    if (stage !== newStage || ticketType !== newTicketType) {
      try {
        await deleteReservation(reservation.id);
        await createReservation(newTicketType.id, {
          num_attendees: newNumAttendees,
        });
      } catch (err) {
        console.error(err);
      } finally {
        onClose();
      }
    } else {
      try {
        await updateReservation(reservation.id, {
          num_attendees: newNumAttendees,
        });
      } catch (err) {
        console.error(err);
      } finally {
        onClose();
      }
    }
  };

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStageId = parseInt(e.target.value);
    const newSelectedStage = await fetchStage(selectedStageId);
    setNewStage(newSelectedStage);
  };

  const handleTicketTypeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedTicketTypeId = parseInt(e.target.value);
    const newSelectedTicketType = await fetchTicketType(selectedTicketTypeId);
    setNewTicketType(newSelectedTicketType);
  };

  const handleNumAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const attendees = parseInt(e.target.value);

    if (attendees > maxAvailable) {
      setAlertMessage("予約数が制限を超えています。");
      setNewNumAttendees(maxAvailable);
    } else {
      setAlertMessage(null);
      setNewNumAttendees(attendees);
    }
  };

  return (
    <Modal onClose={handleCancel}>
      <div className="modal-content">
        <h3>{event.name}</h3>
        {alertMessage && <p>{alertMessage}</p>}
        {step === 1 && (
          <div>
            <label htmlFor="stage-select">ステージ選択</label>
            <select
              id="stage-select"
              onChange={handleStageChange}
              value={newStage.id}
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {new Date(stage.start_time).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </option>
              ))}
            </select>
            <label htmlFor="ticket-type-select">チケット選択</label>
            <select
              id="ticket-type-select"
              onChange={handleTicketTypeChange}
              value={newTicketType.id}
            >
              {ticketTypes.map((ticketType) => (
                <option key={ticketType.id} value={ticketType.id}>
                  {ticketType.type_name} - {ticketType.price}円
                </option>
              ))}
            </select>
            <label htmlFor="num-attendees">枚数</label>
            <input
              id="num-attendees"
              type="number"
              value={newNumAttendees}
              onChange={handleNumAttendeesChange}
              min="1"
              max={maxAvailable}
            />
            <div className="button-group">
              <button onClick={handleNext} disabled={!!alertMessage}>
                次へ
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3>確認</h3>
            <p>
              {new Date(newStage.start_time).toLocaleString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              - {newTicketType.type_name} - {newNumAttendees}枚
            </p>
            <div className="button-group">
              <button onClick={handleBack}>戻る</button>
              <button onClick={handleConfirm}>確定</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReservationChange;
