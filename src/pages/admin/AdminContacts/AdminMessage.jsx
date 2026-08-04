import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import InboxList from "./InboxList";
import ChatWindow from "./ChatWindow";

const AdminMessages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeThread, setActiveThread] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 600;
  const isTablet = windowWidth > 600 && windowWidth <= 1024;

  const showInboxOnly = isMobile && !activeThread;
  const showChatOnly = isMobile && !!activeThread;

  const styles = {
    wrapper: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999,
      overflow: "hidden",
    },
    topBar: {
      display: "flex",
      alignItems: "center",
      padding: "12px 20px",
      backgroundColor: "#0d3b8c",
      borderBottom: "1px solid #0a2f70",
      flexShrink: 0,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    },
    dashboardButton: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.25)",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      color: "#ffffff",
      padding: "8px 14px",
      borderRadius: 8,
      transition: "background 0.15s ease",
    },
    dashboardArrow: {
      fontSize: 16,
      lineHeight: 1,
    },
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f5f6f8",
      overflow: "hidden",
      boxSizing: "border-box",
      minHeight: 0,
    },
    inbox: {
      display: showChatOnly ? "none" : "flex",
      flexDirection: "column",
      flex: isMobile ? "1 1 100%" : isTablet ? "0 0 260px" : "0 0 340px",
      width: isMobile ? "100%" : undefined,
      maxWidth: isMobile ? "100%" : undefined,
      borderRight: isMobile ? "none" : "1px solid #ddd",
      backgroundColor: "#ffffff",
      overflowY: "auto",
      minHeight: 0,
    },
    chat: {
      display: showInboxOnly ? "none" : "flex",
      flexDirection: "column",
      flex: 1,
      width: isMobile ? "100%" : undefined,
      backgroundColor: "#e6f0ff",
      minHeight: 0,
    },
    emptyChat: {
      display: isMobile ? "none" : "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 20,
      fontSize: 16,
      color: "#555",
      backgroundColor: "#e6f0ff",
    },
    backBar: {
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      gap: 8,
      padding: "12px 16px",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #ddd",
      cursor: "pointer",
      fontSize: 15,
      fontWeight: 600,
      color: "#0088cc",
      userSelect: "none",
      flexShrink: 0,
    },
    backArrow: {
      fontSize: 20,
      lineHeight: 1,
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topBar}>
        <button
          style={styles.dashboardButton}
          onClick={() => navigate("/admin/dashboard")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          <span style={styles.dashboardArrow}>←</span>
          <span>{t("adminMessages.backToDashboard")}</span>
        </button>
      </div>

      <div style={styles.container}>
        <div style={styles.inbox}>
          <InboxList onSelect={setActiveThread} activeThread={activeThread} />
        </div>

        {activeThread ? (
          <div style={styles.chat}>
            <div style={styles.backBar} onClick={() => setActiveThread(null)}>
              <span style={styles.backArrow}>←</span>
              <span>{t("adminMessages.back")}</span>
            </div>
            <ChatWindow thread={activeThread} />
          </div>
        ) : (
          <div style={styles.emptyChat}>{t("adminMessages.selectconversation")}</div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;