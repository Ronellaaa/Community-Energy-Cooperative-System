import React from "react";

export default function FinancePagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="fp-pagination">
      <button
        type="button"
        className="fp-button fp-button--secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="fp-pagination__text">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="fp-button fp-button--secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
