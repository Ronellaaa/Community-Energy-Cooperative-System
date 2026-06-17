import React from "react";

export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="fp-section-head">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action || null}
    </div>
  );
}
