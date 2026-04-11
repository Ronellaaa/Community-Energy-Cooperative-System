import React from "react";

export default function DeleteConfirmModal({ open, title, message, onCancel, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div className="fp-modal">
      <div className="fp-modal__backdrop" onClick={onCancel} />
      <div className="fp-modal__panel">
        <h3 className="fp-modal__title">{title}</h3>
        <p className="fp-modal__text">{message}</p>
        <div className="fp-actions">
          <button type="button" className="fp-button fp-button--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="fp-button fp-button--danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
