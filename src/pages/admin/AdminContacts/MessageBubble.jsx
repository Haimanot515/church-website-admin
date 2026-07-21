// components/MessageBubble.jsx
import React from "react";

const MessageBubble = ({ msg, onRetry }) => {
  const isAdmin = !!msg.fromAdmin;

  const bubbleStyle = {
    background: isAdmin ? "#0078ff" : "#e0e0e0",
    color: isAdmin ? "#fff" : "#000",
    padding: "8px 12px",
    borderRadius: "12px",
    maxWidth: "70%",
    wordBreak: "break-word",
    display: "flex",
    flexDirection: "column",
    opacity: msg.pending ? 0.6 : 1,
    border: msg.error ? "1px solid red" : "none",
  };

  const timeLabel =
    msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

  return (
    <div
      className={`message-row ${isAdmin ? "admin" : "user"}`}
      style={{
        display: "flex",
        justifyContent: isAdmin ? "flex-end" : "flex-start",
        marginBottom: "6px",
      }}
    >
      <div className={`message-bubble ${isAdmin ? "admin" : "user"}`} style={bubbleStyle}>
        <div className="message">{msg.message}</div>

        <div
          className="message-meta"
          style={{ marginTop: "4px", alignSelf: "flex-end", display: "flex", gap: 6 }}
        >
          <small className="message-time" style={{ fontSize: "10px", opacity: 0.7 }}>
            {timeLabel}
          </small>

          {msg.pending && (
            <small style={{ fontSize: "10px", color: "#555" }}>sending…</small>
          )}

          {msg.error && (
            <>
              <small style={{ fontSize: "10px", color: "red" }}>failed</small>
              <button
                onClick={() => onRetry?.(msg)}
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#ff4d4f",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
