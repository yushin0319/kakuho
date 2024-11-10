import { useState } from "react";
import { useZxing } from "react-zxing";
import { useReservationContext } from "../context/ReservationContext";
import Modal from "./Modal"; // Modalコンポーネントをインポート
import "../assets/styles/ScannerModal.scss";

interface ScannerModalProps {
  stageId: number;
  onClose: () => void;
}

const ScannerModal = ({ stageId, onClose }: ScannerModalProps) => {
  const [scanResult, setScanResult] = useState("");
  const { reservations } = useReservationContext();
  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedId = result.getText().replace("Kakuho-", ""); // プレフィックスを除去
      setScanResult(scannedId);
      handleCheckReservation(scannedId);
    },
  });

  const handleCheckReservation = (reservationId: string) => {
    const reservation = reservations.find(
      (res) => res.reservation.id === parseInt(reservationId, 10)
    );
    if (!reservation) {
      alert("予約が見つかりません。");
      return;
    }

    if (reservation.stage.id !== stageId) {
      alert("このQRコードは他のステージのものです。");
    } else {
      alert("受付完了！");
      // ここで `is_paid` を更新する処理を追加
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="scanner-content">
        <video ref={ref} />
        <p>スキャン結果: {scanResult}</p>
        <button onClick={onClose}>閉じる</button>
      </div>
    </Modal>
  );
};

export default ScannerModal;
