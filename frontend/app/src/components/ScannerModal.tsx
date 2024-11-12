import { useState } from "react";
import { useZxing } from "react-zxing";
import { useReservationContext } from "../context/ReservationContext";
import Modal from "./Modal";
import "../assets/styles/ScannerModal.scss";

interface ScannerModalProps {
  stageId: number;
  onClose: () => void;
}

const ScannerModal = ({ stageId, onClose }: ScannerModalProps) => {
  const [scanResult, setScanResult] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // アラート用のメッセージ
  const { reservations } = useReservationContext();
  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedId = result.getText().replace("Kakuho-", "");
      setScanResult(scannedId);
      handleCheckReservation(scannedId);
    },
  });

  const handleCheckReservation = (reservationId: string) => {
    const reservation = reservations.find(
      (res) => res.reservation.id === parseInt(reservationId, 10)
    );
    if (!reservation) {
      setAlertMessage("予約が見つかりません。");
      return;
    }

    if (reservation.stage.id !== stageId) {
      setAlertMessage("このQRコードは他のステージのものです。");
    } else {
      setAlertMessage("受付完了！");
      // `is_paid` を更新する処理を追加
      onClose();
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="scanner-content">
        <video ref={ref} />
        <p>スキャン結果: {scanResult}</p>
        <button onClick={onClose}>閉じる</button>

        {alertMessage && (
          <Modal onClose={() => setAlertMessage(null)}>
            <div className="alert-modal-content">
              <p>{alertMessage}</p>
              <button onClick={() => setAlertMessage(null)}>閉じる</button>
            </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
};

export default ScannerModal;
