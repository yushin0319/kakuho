// app/src/components/TicketPopup.tsx
import React from "react";

interface TicketPopupProps {
  stageId: number;
  onClose: () => void;
}

const TicketPopup: React.FC<TicketPopupProps> = ({ stageId, onClose }) => {
  // 仮のデータや表示内容（必要に応じてAPIから詳細データを取得するロジックを追加）
  const stageDetails = {
    name: `Stage ${stageId}`,
    description: "This is a sample description for the selected stage.",
    ticketsAvailable: 20,
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        width: "300px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      <h2>{stageDetails.name}</h2>
      <p>{stageDetails.description}</p>
      <p>Tickets Available: {stageDetails.ticketsAvailable}</p>
      <button onClick={onClose} style={{ marginTop: "16px" }}>
        Close
      </button>
    </div>
  );
};

export default TicketPopup;
