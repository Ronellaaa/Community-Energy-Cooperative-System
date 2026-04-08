
export const STATUS_CONFIG = {
  Approved: {
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "Approved",
  },
  Rejected: {
    color: "text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "bg-red-400",
    label: "Rejected",
  },
  Active: {
    color: "text-cyan-300",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
    label: "Active",
  },
  Pending: {
    color: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    label: "Pending",
  },
};

export const TYPE_ICONS = {
  Solar: "☀",
  Wind: "◈",
  Hydro: "◉",
};

export const pageWrapperStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a1f0f 0%, #0d2b15 30%, #0f3620 60%, #0a2010 100%)",
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
};

export const glassPanelStyle = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
};

export const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e8f5e9",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
};

export const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6abf7b",
  marginBottom: "6px",
};

export const primaryBtnStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: "700",
  fontSize: "15px",
  letterSpacing: "0.03em",
  cursor: "pointer",
  transition: "opacity 0.2s, transform 0.1s",
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "0.04em",
      }}
      className={`${cfg.bg} ${cfg.color} border ${cfg.border}`}
    >
      <span
        style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block" }}
        className={cfg.dot}
      />
      {cfg.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#a7d7b2",
        fontWeight: "500",
      }}
    >
      <span style={{ fontSize: "13px" }}>{TYPE_ICONS[type] || "◆"}</span>
      {type}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "4px", height: "28px", background: "linear-gradient(#22c55e, #16a34a)", borderRadius: "2px" }} />
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#e8f5e9", letterSpacing: "-0.02em", margin: 0 }}>
            {title}
          </h1>
        </div>
        {subtitle && (
          <p style={{ fontSize: "13px", color: "#6abf7b", margin: "0 0 0 14px" }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function SectionCard({ children, style = {} }) {
  return (
    <div style={{ ...glassPanelStyle, padding: "28px", ...style }}>
      {children}
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export function BackLink({ onClick, label = "Back to Projects" }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        color: "#6abf7b",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "0",
        marginBottom: "28px",
        letterSpacing: "0.02em",
      }}
    >
      ← {label}
    </button>
  );
}

export const focusInputStyle = `
  .eco-input:focus {
    border-color: rgba(34, 197, 94, 0.6) !important;
    background: rgba(255,255,255,0.09) !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }
  .eco-input::placeholder {
    color: rgba(255,255,255,0.2);
  }
  .eco-input option {
    background: #0d2b15;
    color: #e8f5e9;
  }
  .eco-btn-primary:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }
  .eco-btn-primary:active {
    transform: translateY(0);
  }
  .eco-card-hover:hover {
    border-color: rgba(34, 197, 94, 0.25) !important;
    background: rgba(255,255,255,0.06) !important;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up {
    animation: fadeUp 0.4s ease both;
  }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.1s; }
  .fade-up-3 { animation-delay: 0.15s; }
  .fade-up-4 { animation-delay: 0.2s; }
  .fade-up-5 { animation-delay: 0.25s; }
`;
