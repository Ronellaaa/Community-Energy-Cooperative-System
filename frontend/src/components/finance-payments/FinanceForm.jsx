import React from "react";

export default function FinanceForm({ fields, values, onChange, onSubmit, submitLabel, cancelLabel, onCancel }) {
  return (
    <form className="fp-form" onSubmit={onSubmit}>
      <div className="fp-grid fp-grid--2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={`fp-field ${field.fullWidth ? "fp-field--full" : ""}`}
          >
            <label className="fp-field__label">{field.label}</label>
            {field.type === "select" ? (
              <select
                className="fp-input"
                value={values[field.name] ?? ""}
                onChange={(event) => onChange(field.name, event.target.value)}
                disabled={field.disabled}
              >
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                className="fp-input fp-input--textarea"
                rows={field.rows || 3}
                value={values[field.name] ?? ""}
                onChange={(event) => onChange(field.name, event.target.value)}
                disabled={field.disabled}
              />
            ) : (
              <input
                className="fp-input"
                type={field.type || "text"}
                value={values[field.name] ?? ""}
                onChange={(event) => onChange(field.name, event.target.value)}
                disabled={field.disabled}
                required={field.required}
                min={field.min}
              />
            )}
          </div>
        ))}
      </div>

      <div className="fp-actions">
        {onCancel ? (
          <button type="button" className="fp-button fp-button--secondary" onClick={onCancel}>
            {cancelLabel || "Cancel"}
          </button>
        ) : null}
        <button type="submit" className="fp-button">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
