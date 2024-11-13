// app/src/components/SannerModal.tsx
import { useState } from "react";
import { useZxing } from "react-zxing";
import PaidStatusController from "./PaidStatusController";
import { useReservationContext } from "../context/ReservationContext";
import Modal from "./Modal";
import "../assets/styles/ScannerModal.scss";

interface ScannerModalProps {
  stageId: number;
  onClose: () => void;
}

const ScannerModal = ({ stageId, onClose }: ScannerModalProps) => {
  const [scanResult, setScanResult] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const { reservations } = useReservationContext();
  const { ref } = useZxing({
    onDecodeResult(result) {
      if (!result.getText().startsWith("Kakuho-")) {
        setAlertMessage("このQRコードは有効ではありません");
        return;
      }
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
      setAlertMessage("ご予約が見つかりません");
      return;
    }

    if (reservation.stage.id !== stageId) {
      setAlertMessage("このQRコードは他のステージのものです");
    } else if (reservation.reservation.is_paid) {
      setAlertMessage("このご予約はお支払い済です");
    } else {
      setIsPaying(true);
    }
  };

  const handleClose = () => {
    setScanResult("");
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="scanner-content">
        <video ref={ref} />
        <button onClick={onClose}>閉じる</button>

        {alertMessage && (
          <Modal onClose={() => setAlertMessage(null)}>
            <div className="alert-modal-content">
              <p>{alertMessage}</p>
              <button onClick={() => setAlertMessage(null)}>閉じる</button>
            </div>
          </Modal>
        )}

        {isPaying && (
          <PaidStatusController
            reservationId={parseInt(scanResult, 10)}
            onClose={handleClose}
          />
        )}
      </div>
    </Modal>
  );
};

export default ScannerModal;
