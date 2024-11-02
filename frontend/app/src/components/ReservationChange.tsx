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
  fetchStageTicketTypes,
  fetchTicketType,
} from "../services/api/ticketType";

import {
  ReservationResponse,
  EventResponse,
  StageResponse,
  TicketTypeResponse,
} from "../services/interfaces";
import { getDate, getHour } from "../services/utils";
import { useReservationContext } from "../context/ReservationContext";
import { useNewItemContext } from "../context/NewItemContext";
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
  // ステップ管理用の状態
  const [step, setStep] = useState(1);

  // 新しいステージとチケットタイプを管理する状態
  const [newStage, setNewStage] = useState<StageResponse>(stage);
  const [newTicketType, setNewTicketType] =
    useState<TicketTypeResponse>(ticketType);

  // 予約人数と選択可能なステージやチケットタイプのリスト
  const [newNumAttendees, setNewNumAttendees] = useState<number>(
    reservation.num_attendees
  );
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [maxAvailable, setMaxAvailable] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const { reloadReservations } = useReservationContext();
  const { addNewItem } = useNewItemContext();

  // アラートメッセージを評価する関数
  const evaluateAlert = () => {
    if (newNumAttendees > maxAvailable) {
      setAlertMessage("申し訳ございません。ご希望のチケットは満席です。");
    } else {
      setAlertMessage(null);
    }
  };

  // event.id の変更に応じてステージリストをロードする
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

  // newStage の変更に応じてチケットタイプをロードする
  useEffect(() => {
    let isMounted = true;
    const loadTicketTypes = async () => {
      const ticketTypes = await fetchStageTicketTypes(newStage.id);
      if (isMounted) {
        setTicketTypes(ticketTypes);
        setNewTicketType(ticketTypes[0]);
      }
    };
    loadTicketTypes();
    return () => {
      isMounted = false;
    };
  }, [newStage]);

  // newTicketType の変更に応じて最大予約可能数を計算する
  useEffect(() => {
    const available =
      newTicketType.id === ticketType.id
        ? newTicketType.available + reservation.num_attendees
        : newTicketType.available;
    setMaxAvailable(available);
  }, [newTicketType]);

  // maxAvailable と newNumAttendees の変化に応じてアラートを評価する
  useEffect(() => {
    evaluateAlert();
  }, [maxAvailable, newNumAttendees]);

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
    if (stage !== newStage || ticketType !== newTicketType) {
      try {
        if (stage !== newStage || ticketType !== newTicketType) {
          // ステージやチケットタイプが変更された場合
          await deleteReservation(reservation.id);
          const newItem = await createReservation(newTicketType.id, {
            num_attendees: newNumAttendees,
          });
          addNewItem(newItem.id); // 新規作成された予約のIDを追加
        } else {
          // ステージやチケットタイプが同じ場合は人数だけを更新
          await updateReservation(reservation.id, {
            num_attendees: newNumAttendees,
          });
          addNewItem(reservation.id); // 更新した予約のIDを追加
        }
        reloadReservations(); // 予約リストを再取得
      } catch (err) {
        console.error("Reservation update failed:", err);
      } finally {
        onClose(); // モーダルを閉じる
      }
    }
  };

  // ステージ選択の変更処理
  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const fetchedStage = await fetchStage(id);
    setNewStage(fetchedStage); // ステージを更新
  };

  // チケットタイプ選択の変更処理
  const handleTicketTypeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = parseInt(e.target.value);
    const fetchedTicketType = await fetchTicketType(id);
    setNewTicketType(fetchedTicketType); // 券種を更新
  };

  // 予約人数の変更処理
  const handleNumAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const attendees = parseInt(e.target.value);
    setNewNumAttendees(attendees); // 枚数を更新
  };

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
                  {getDate(new Date(stage.start_time))}{" "}
                  {getHour(new Date(stage.start_time))}
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
              {getDate(new Date(stage.start_time))}{" "}
              {getHour(new Date(stage.start_time))} - {newTicketType.type_name}{" "}
              - {newNumAttendees}枚
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
