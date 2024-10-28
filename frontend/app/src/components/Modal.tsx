// app/src/components/Modal.tsx
import React, { ReactNode } from "react";
import "../assets/styles/Modal.scss";

interface ModalProps {
  children: ReactNode; // モーダル内に表示するコンテンツ
  onClose: () => void; // モーダルを閉じる関数
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
