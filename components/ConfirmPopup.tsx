import styles from './ConfirmPopup.module.css';

interface ConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function ConfirmPopup({ isOpen, onClose, onConfirm, title }: ConfirmPopupProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.buttons}>
          <button className={`${styles.btn} ${styles.btnConfirm}`} onClick={onConfirm}>
            Xóa
          </button>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
