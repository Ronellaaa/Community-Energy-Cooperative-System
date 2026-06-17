import React from "react";

export default function ActionToolbar({ actions }) {
  return (
    <div className="fp-toolbar">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={action.secondary ? "fp-button-secondary" : "fp-button"}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.icon || null}
          {action.label}
        </button>
      ))}
    </div>
  );
}
