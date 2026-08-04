import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import API from "../../../api/api";

const InboxList = ({ onSelect, activeThread }) => {
  const { t } = useTranslation();
  const [threads, setThreads] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const loaderRef = useRef();

  // Track viewport width so inline styles can respond to screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadThreads = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await API.get(
        `/admin/threads?limit=20${cursor ? `&cursor=${cursor}` : ""}`
      );

      // Deduplicate threads by _id
      setThreads((prev) => {
        const merged = [...prev, ...res.data.threads];
        return merged.filter(
          (thread, index, self) =>
            index === self.findIndex((th) => th._id === thread._id)
        );
      });

      setCursor(res.data.nextCursor);
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadThreads(),
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [cursor]);

  const styles = {
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      borderRight: isMobile ? "none" : "1px solid #ddd",
      borderBottom: isMobile ? "1px solid #ddd" : "none",
      minHeight: 0,
      width: "100%",
    },
    header: {
      padding: isMobile ? "12px 14px" : "16px",
      fontWeight: 600,
      fontSize: isMobile ? 16 : 18,
      color: "#0a0a0aff",
      backgroundColor: "rgba(240, 243, 247, 0.97)",
      flexShrink: 0,
    },
    list: {
      flex: 1,
      overflowY: "auto",
      minHeight: 0,
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },
    thread: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: isMobile ? "10px 12px" : "10px 16px",
      borderBottom: "1px solid #eee",
      cursor: "pointer",
      transition: "background 0.2s ease",
      gap: isMobile ? 8 : 12,
    },
    activeThread: {
      backgroundColor: "#0078ff",
      color: "#fff",
    },
    threadText: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0,
      flex: 1,
    },
    threadName: {
      fontSize: isMobile ? 14 : 15,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      display: "block",
    },
    threadPreview: {
      margin: 0,
      fontSize: isMobile ? 12 : 13,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    meta: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      fontSize: isMobile ? 11 : 12,
      color: "#555",
      flexShrink: 0,
    },
    badge: {
      backgroundColor: "#ff4d4f",
      color: "#fff",
      borderRadius: "50%",
      width: isMobile ? 16 : 18,
      height: isMobile ? 16 : 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      marginTop: 4,
    },
    loader: {
      textAlign: "center",
      padding: 8,
      color: "#0078ff",
      fontSize: isMobile ? 13 : 14,
    },
    empty: {
      textAlign: "center",
      padding: 20,
      color: "#888",
      fontSize: isMobile ? 13 : 14,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>{t("inboxList.header")}</div>

      {/* Scroll Area */}
      <div style={styles.list} className="hide-scrollbar">
        {threads.map((thread) => {
          const isActive = activeThread?._id === thread._id;

          return (
            <div
              key={thread._id}
              style={{
                ...styles.thread,
                ...(isActive ? styles.activeThread : {}),
              }}
              onClick={() => onSelect(thread)}
            >
              <div style={styles.threadText}>
                <strong style={styles.threadName}>{thread.userName}</strong>
                <p style={styles.threadPreview}>{thread.lastMessage}</p>
              </div>

              <div style={styles.meta}>
                {/* Guard against null lastMessageAt */}
                {thread.lastMessageAt && (
                  <span>
                    {new Date(thread.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {thread.unreadForAdmin > 0 && (
                  <span style={styles.badge}>{thread.unreadForAdmin}</span>
                )}
              </div>
            </div>
          );
        })}

        {!loading && threads.length === 0 && (
          <div style={styles.empty}>{t("inboxList.empty")}</div>
        )}

        <div ref={loaderRef} style={styles.loader}>
          {loading && t("inboxList.loading")}
        </div>
      </div>
    </div>
  );
};

export default InboxList;