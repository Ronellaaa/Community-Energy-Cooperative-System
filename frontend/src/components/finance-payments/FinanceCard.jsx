import React from "react";

export default function FinanceCard({ title, subtitle, children, action }) {
  return (
    <section className="fp-card">
      {(title || subtitle || action) && (
        <div className="fp-card__header">
          <div>
            {title ? <h2 className="fp-card__title">{title}</h2> : null}
            {subtitle ? <p className="fp-card__subtitle">{subtitle}</p> : null}
          </div>
          {action || null}
        </div>
      )}
      {children}
    </section>
  );
}
