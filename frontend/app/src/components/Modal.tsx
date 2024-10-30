// app/src/components/Modal.tsx
import { ReactNode } from "react";
import "../assets/styles/Modal.scss";

interface ModalProps {
  children: ReactNode; // モーダル内に表示するコンテンツ
  onClose: () => void; // モーダルを閉じる関数
}

const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
