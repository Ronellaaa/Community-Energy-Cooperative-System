import React from "react";

export const Btn = ({ children, variant = "primary", onClick, type = "button", disabled, style }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 20px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    opacity: disabled ? 0.5 : 1, ...style,
  };
  const variants = {
    primary: { background: "var(--accent)", color: "#000" },
    ghost:   { background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" },
    danger:  { background: "rgba(255,77,109,0.15)", color: "var(--danger)", border: "1px solid rgba(255,77,109,0.3)" },
    blue:    { background: "rgba(79,142,247,0.15)", color: "var(--accent3)", border: "1px solid rgba(79,142,247,0.3)" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    Active:   { bg: "rgba(0,229,160,0.12)",   color: "#00e5a0", border: "rgba(0,229,160,0.3)" },
    Approved: { bg: "rgba(79,142,247,0.12)",  color: "#4f8ef7", border: "rgba(79,142,247,0.3)" },
    Draft:    { bg: "rgba(107,122,153,0.12)", color: "#6b7a99", border: "rgba(107,122,153,0.3)" },
  };
  const c = map[status] || map.Draft;
  return (
    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 500, letterSpacing: "0.05em", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status?.toUpperCase()}
    </span>
  );
};

export const PageHeader = ({ breadcrumb, title, subtitle, action }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.05em" }}>
        PHASE 2 / <span style={{ color: "var(--accent)" }}>{breadcrumb}</span>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card = ({ children, style, onClick, hover }) => (
  <div
    onClick={onClick}
    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, transition: "all 0.22s", cursor: onClick ? "pointer" : "default", ...style }}
    onMouseEnter={hover ? (e) => { e.currentTarget.style.borderColor = "rgba(0,229,160,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)"; } : undefined}
    onMouseLeave={hover ? (e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } : undefined}
  >
    {children}
  </div>
);

export const FormField = ({ label, children, error }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
    {children}
    {error && <span style={{ fontSize: 11, color: "var(--danger)" }}>{error}</span>}
  </div>
);

export const Input = React.forwardRef(({ style, ...props }, ref) => (
  <input
    ref={ref}
    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13.5, outline: "none", width: "100%", transition: "border-color 0.2s", ...style }}
    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,229,160,0.08)"; }}
    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
    {...props}
  />
));

export const Select = ({ children, style, ...props }) => (
  <select
    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13.5, outline: "none", width: "100%", cursor: "pointer", ...style }}
    {...props}
  >
    {children}
  </select>
);

export const ErrorMsg = ({ message }) => message ? (
  <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#ff8099", display: "flex", gap: 10, alignItems: "center" }}>
    <span>⚠️</span> {message}
  </div>
) : null;

export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 14, color: "var(--muted)" }}>
    <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>{text}</span>
  </div>
);

export const MetricBox = ({ label, value, color = "var(--text)" }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label}</div>
  </div>
);

export const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", variant = "danger" }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: 380, animation: "fadeUp 0.2s ease" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant={variant} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
};
