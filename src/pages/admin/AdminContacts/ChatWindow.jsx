// components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import API from "../../../api/api"; // ensure this points to your configured axios instance
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ thread }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [threadData, setThreadData] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [inputHeight, setInputHeight] = useState(56);

  const textareaRef = useRef(null);
  const bodyRef = useRef(null);
  const inputContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 600;
  const isTablet = windowWidth > 600 && windowWidth <= 1024;

  // Load messages when thread changes
  useEffect(() => {
    if (!thread?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/admin/messages/${thread._id}?limit=100`);
        setMessages(res.data.messages || []);
        setThreadData(res.data.thread || null);
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

  // Keep body's bottom padding in sync with the (variable-height) fixed input bar
  useEffect(() => {
    if (inputContainerRef.current) {
      setInputHeight(inputContainerRef.current.offsetHeight);
    }
  }, [text, isMobile, isTablet]);

  // Auto-grow textarea
  const handleTextChange = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "36px";
      ta.style.height = `${ta.scrollHeight}px`;
    }
    if (inputContainerRef.current) {
      setInputHeight(inputContainerRef.current.offsetHeight);
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

  const displayThread = threadData || thread;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      width: "100%",
      backgroundColor: "#e6f0ff",
      boxSizing: "border-box",
      minHeight: 0,
      position: "relative", // anchor point for the fixed input bar
      overflow: "hidden",
    },
    header: {
      height: isMobile ? 48 : 56,
      padding: isMobile ? "0 12px" : "0 16px",
      display: "flex",
      alignItems: "center",
      fontWeight: 600,
      fontSize: isMobile ? 15 : 16,
      background: "#f8fbff",
      flexShrink: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    body: {
      flex: 1,
      overflowY: "auto",
      padding: isMobile ? "10px 10px" : isTablet ? "12px 14px" : "12px 16px",
      // reserve space so the last message isn't hidden behind the fixed input bar
      paddingBottom: inputHeight + (isMobile ? 12 : 16),
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minHeight: 0,
      WebkitOverflowScrolling: "touch",
    },
    emptyState: {
      textAlign: "center",
      marginTop: "20px",
      color: "#555",
      fontSize: isMobile ? 14 : 15,
      padding: "0 12px",
    },
    inputContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "flex-end",
      padding: isMobile ? "8px 8px" : "8px 12px",
      borderTop: "1px solid #ccc",
      background: "#f0f4ff",
      gap: 6,
      flexShrink: 0,
      boxSizing: "border-box",
      zIndex: 5,
    },
    textarea: {
      flex: 1,
      width: "auto",
      minHeight: isMobile ? 40 : 36,
      maxHeight: isMobile ? 90 : 110,
      padding: isMobile ? "8px 10px" : "6px 8px",
      fontSize: isMobile ? 16 : 14, // 16px prevents iOS auto-zoom on focus
      borderRadius: 6,
      border: "1px solid #ccc",
      resize: "none",
      outline: "none",
      overflowY: "auto",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    button: {
      height: isMobile ? 40 : 36,
      padding: isMobile ? "0 14px" : "0 16px",
      fontSize: isMobile ? 13 : 14,
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
        {displayThread?.userName || t("chatWindow.noconversation")}
      </div>

      <div ref={bodyRef} style={styles.body}>
        {thread?._id ? (
          messages.map((msg, index) => (
            <MessageBubble key={msg._id || index} msg={msg} onRetry={retryMessage} />
          ))
        ) : (
          <div style={styles.emptyState}>{t("chatWindow.selectconversation")}</div>
        )}
      </div>

      <div ref={inputContainerRef} style={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={t("chatWindow.typemessage")}
          style={styles.textarea}
          disabled={loading || !thread?._id}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || loading || !thread?._id}
          style={styles.button}
        >
          {t("chatWindow.send")}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;