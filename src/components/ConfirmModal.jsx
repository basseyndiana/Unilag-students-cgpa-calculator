import { useEffect, useRef } from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', isDanger = true }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h2 id="modal-title" className="modal__title">{title}</h2>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button
            ref={cancelRef}
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`btn ${isDanger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

