// src/components/feature-1/FeedbackMessage.jsx
import { useState, useEffect } from "react";

const FEEDBACK_CONFIGS = {
  success: {
    icon: "✓",
    bg: "rgba(149,229,109,0.12)",
    border: "rgba(149,229,109,0.35)",
    color: "#a7e87a",
    iconBg: "rgba(149,229,109,0.25)",
  },
  error: {
    icon: "✕",
    bg: "rgba(255,126,126,0.12)",
    border: "rgba(255,126,126,0.35)",
    color: "#fca5a5",
    iconBg: "rgba(255,126,126,0.25)",
  },
  warning: {
    icon: "⚠",
    bg: "rgba(253,230,138,0.12)",
    border: "rgba(253,230,138,0.35)",
    color: "#fde68a",
    iconBg: "rgba(253,230,138,0.25)",
  },
  info: {
    icon: "ℹ",
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.35)",
    color: "#93c5fd",
    iconBg: "rgba(96,165,250,0.25)",
  },
  auth: {
    icon: "🔒",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
    color: "#c4b5fd",
    iconBg: "rgba(167,139,250,0.25)",
  },
};

export default function FeedbackMessage({ 
  type = "info", 
  message, 
  onDismiss, 
  autoDismiss = false,
  duration = 5000,
  action,
  actionLabel,
  onAction,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const config = FEEDBACK_CONFIGS[type] || FEEDBACK_CONFIGS.info;

  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!message) return null;

  return (
    <div style={{
      padding: "16px 20px",
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: "12px",
      marginBottom: "20px",
      animation: isVisible ? "slideInDown 0.3s ease" : "slideOutUp 0.3s ease forwards",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: config.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "900",
          color: config.color,
          flexShrink: 0,
        }}>
          {config.icon}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0,
            color: config.color,
            fontSize: "14px",
            fontWeight: "600",
            lineHeight: "1.6",
          }}>
            {message}
          </p>
          
          {action && (
            <button
              onClick={onAction}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: config.iconBg,
                border: `1px solid ${config.border}`,
                borderRadius: "6px",
                color: config.color,
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = config.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = config.iconBg;
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px 8px",
              transition: "color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            ✕
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}