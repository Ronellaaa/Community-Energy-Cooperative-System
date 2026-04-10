import React from "react";

export default function EmptyState({ title, description }) {
  return (
    <div className="fp-card fp-card--pad fp-empty">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
