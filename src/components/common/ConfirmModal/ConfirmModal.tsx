import React from "react";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "approve" | "account-approve" | "reject" | "default";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  type = "default",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles["confirm-modal-overlay"]} onClick={onCancel}>
      <div className={styles["confirm-modal-content"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["confirm-modal-header"]}>
          <h2 className={styles["confirm-modal-title"]}>{title}</h2>
        </div>
        <div className={styles["confirm-modal-body"]}>
          <p className={styles["confirm-modal-message"]}>{message}</p>
        </div>
        <div className={styles["confirm-modal-footer"]}>
          <button className={`${styles["confirm-modal-btn"]} ${styles["cancel-btn"]}`} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`${styles["confirm-modal-btn"]} ${styles["confirm-btn"]} ${styles[type]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

