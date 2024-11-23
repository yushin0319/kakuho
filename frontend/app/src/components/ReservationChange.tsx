// app/src/components/ReservationChange.tsx
import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
  createReservation,
  updateReservation,
  deleteReservation,
} from "../services/api/reservation";
import { fetchEventStages, fetchStage } from "../services/api/stage";
import {
  fetchStageSeatGroups,
  fetchSeatGroup,
  getCapacity,
} from "../services/api/seatGroup";
import {
  fetchSeatGroupTicketTypes,
  fetchTicketType,
} from "../services/api/ticketType";

import {
  ReservationResponse,
  EventResponse,
  StageResponse,
  SeatGroupResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { toJST } from "../services/utils";
import { useReservationContext } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";
import "../assets/styles/ReservationChange.scss";

interface ReservationChangeProps {
  reservation: ReservationResponse;
  event: EventResponse;
  stage: StageResponse;
  seatGroup: SeatGroupResponse;
  ticketType: TicketTypeResponse;
  onClose: () => void;
}

const ReservationChange = ({
  reservation,
  event,
  stage,
  seatGroup,
  ticketType,
  onClose,
}: ReservationChangeProps) => {
  const [step, setStep] = useState(1);
  const [newStage, setNewStage] = useState<StageResponse>(stage);
  const [newSeatGroup, setNewSeatGroup] =
    useState<SeatGroupResponse>(seatGroup);
  const [newTicketType, setNewTicketType] =
    useState<TicketTypeResponse>(ticketType);
  const [newNumAttendees, setNewNumAttendees] = useState<number>(
    reservation.num_attendees
  );
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [maxAvailable, setMaxAvailable] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { reloadReservations } = useReservationContext();
  const { addNewItem } = useNewItemContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // アラートメッセージを評価する関数
  const evaluateAlert = () => {
    if (newNumAttendees > maxAvailable) {
      setAlertMessage("申し訳ございません。ご希望のチケットは満席です。");
    } else {
      setAlertMessage(null);
    }
  };

  useEffect(() => {
    const loadMaxAvailable = async () => {
      const available = await getCapacity(ticketType.id);
      setMaxAvailable(available + reservation.num_attendees);
    };
    loadMaxAvailable();

    const loadStages = async () => {
      const stages = await fetchEventStages(event.id);
      setStages(stages);
    };
    loadStages();

    const loadTicketTypes = async () => {
      const loadedTicketTypes = [];
      const seatGroups = await fetchStageSeatGroups(stage.id);
      for (const seatGroup of seatGroups) {
        const types = await fetchSeatGroupTicketTypes(seatGroup.id);
        loadedTicketTypes.push(...types);
      }
      setTicketTypes(loadedTicketTypes);
    };
    loadTicketTypes();
  }, []);

  useEffect(() => {
    const loadCapacity = async () => {
      const newAvailable = await getCapacity(newTicketType.id);
      const available =
        newSeatGroup.id === seatGroup.id
          ? newAvailable + reservation.num_attendees
          : newAvailable;
      setMaxAvailable(available);
    };
    loadCapacity();
  }, [newTicketType]);

  useEffect(() => {
    if (maxAvailable > 0) {
      evaluateAlert();
      setIsLoading(false);
    }
  }, [maxAvailable, newNumAttendees]);

  // ステージ選択の変更処理
  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const fetchedStage = await fetchStage(id);
    setNewStage(fetchedStage);
    const newSeatGroups = await fetchStageSeatGroups(id);
    const newTicketTypes = [];
    for (const seatGroup of newSeatGroups) {
      const types = await fetchSeatGroupTicketTypes(seatGroup.id);
      newTicketTypes.push(...types);
    }
    setNewSeatGroup(newSeatGroups[0]);
    setTicketTypes(newTicketTypes);
    setNewTicketType(newTicketTypes[0]);
  };

  // チケットタイプ選択の変更処理
  const handleTicketTypeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = parseInt(e.target.value);
    const fetchedTicketType = await fetchTicketType(id);
    const newSeatGroup = await fetchSeatGroup(fetchedTicketType.seat_group_id);
    setNewSeatGroup(newSeatGroup);
    const newStage = await fetchStage(newSeatGroup.stage_id);
    setNewStage(newStage);
    setNewTicketType(fetchedTicketType);
  };

  // 予約人数の変更処理
  const handleNumAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const attendees = parseInt(e.target.value);
    setNewNumAttendees(attendees);
  };

  // キャンセルボタンの処理
  const handleCancel = () => {
    onClose();
  };

  // 次のステップに進む処理
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  // 前のステップに戻る処理
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  // 予約の確認と確定処理
  const handleConfirm = async () => {
    const user_id = reservation.user_id;
    try {
      if (
        stage !== newStage ||
        seatGroup !== newSeatGroup ||
        ticketType !== newTicketType
      ) {
        await deleteReservation(reservation.id);
        const newItem = await createReservation(newTicketType.id, {
          num_attendees: newNumAttendees,
          user_id: user_id,
        });
        addNewItem(newItem.id);
      } else {
        await updateReservation(reservation.id, {
          num_attendees: newNumAttendees,
          user_id: user_id,
        });
        addNewItem(reservation.id);
      }
      reloadReservations();
    } catch (err) {
      console.error("Reservation update failed:", err);
    } finally {
      onClose();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Modal onClose={handleCancel}>
      <div className="modal-content">
        <h3>{event.name}</h3>
        {alertMessage && <p className="alert">{alertMessage}</p>}
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
                  {toJST(stage.start_time, "dateTime")}
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
              {toJST(newStage.start_time, "dateTime")} -{" "}
              {newTicketType.type_name} - {newNumAttendees}枚
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
