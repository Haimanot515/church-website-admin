// components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../../../api/api"; // ensure this points to your configured axios instance
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ thread }) => {
  const [messages, setMessages] = useState([]);
  const [threada,setThread]=useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef(null);
  const bodyRef = useRef(null);

  // Load messages when thread changes
  useEffect(() => {
    if (!thread?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/admin/messages/${thread._id}?limit=100`,);
        setMessages(res.data.messages || []);
        setThread(res.data.thread);

      } catch (err) {
        console.error("Fetch messages failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [thread]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-grow textarea
  const handleTextChange = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "36px";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || loading) return;
    if (!thread?._id) {
      console.warn("No thread selected");
      return;
    }

    const clientId = Date.now().toString();

    const optimisticMsg = {
      threadId: thread._id,
      message: text,
      clientId,
      createdAt: new Date().toISOString(),
      fromAdmin: true,
      pending: true,
      error: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      setLoading(true);

      const res = await API.post("/admin/reply", {
        threadId: thread._id,
        message: optimisticMsg.message,
        clientId,
      });

      const returnedMsg = res.data?.adminMsg || {};
      // Defensive patches to ensure reconciliation always works
      returnedMsg.clientId = returnedMsg.clientId || clientId;
      returnedMsg.fromAdmin = true;
      returnedMsg.createdAt = returnedMsg.createdAt || new Date().toISOString();

      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === clientId
            ? { ...returnedMsg, pending: false, error: false }
            : m
        )
      );
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === clientId ? { ...m, pending: false, error: true } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Retry a failed message using the same clientId, replacing the bubble cleanly
  const retryMessage = async (failedMsg) => {
    if (loading) return;

    try {
      setLoading(true);
      // Mark as pending again immediately for responsive UI
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === failedMsg.clientId ? { ...m, pending: true, error: false } : m
        )
      );

      const res = await API.post("/admin/reply", {
        threadId: failedMsg.threadId,
        message: failedMsg.message,
        clientId: failedMsg.clientId,
      });

      const returnedMsg = res.data?.adminMsg || {};
      returnedMsg.clientId = returnedMsg.clientId || failedMsg.clientId;
      returnedMsg.fromAdmin = true;
      returnedMsg.createdAt = returnedMsg.createdAt || new Date().toISOString();

      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === failedMsg.clientId
            ? { ...returnedMsg, pending: false, error: false }
            : m
        )
      );
    } catch (err) {
      console.error("Retry failed:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === failedMsg.clientId ? { ...m, pending: false, error: true } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "#e6f0ff",
    },
    header: {
      height: 56,
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      fontWeight: 600,
      background: "#f8fbff",
      flexShrink: 0,
    },
    body: {
      flex: 1,
      overflowY: "auto",
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minHeight: 0,
    },
    inputContainer: {
      display: "flex",
      alignItems: "flex-end",
      padding: "8px 12px",
      borderTop: "1px solid #ccc",
      background: "#f0f4ff",
      gap: 6,
      flexShrink: 0,
    },
    textarea: {
      width: "85%",
      minHeight: 36,
      maxHeight: 110,
      padding: "6px 8px",
      fontSize: 14,
      borderRadius: 6,
      border: "1px solid #ccc",
      resize: "none",
      outline: "none",
      overflowY: "auto",
    },
    button: {
      height: 36,
      padding: "0 16px",
      fontWeight: 600,
      background: "#0078ff",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {thread?.userName || "No thread selected"}
      </div>

      <div ref={bodyRef} style={styles.body}>
        {thread?._id ? (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg._id|| index}
              msg={msg}
              onRetry={retryMessage}
            />
          ))
        ) : (
          <div style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
            Select a thread to start messaging
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          style={styles.textarea}
          disabled={loading || !thread?._id}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || loading || !thread?._id}
          style={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
