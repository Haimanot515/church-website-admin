import { useEffect, useState, useRef } from "react";
import API from "../../../api/api";

const InboxList = ({ onSelect, activeThread }) => {
  const [threads, setThreads] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef();

  const loadThreads = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await API.get(
        `/admin/threads?limit=20${cursor ? `&cursor=${cursor}` : ""}`
      );

      // ✅ Deduplicate threads by _id
      setThreads((prev) => {
        const merged = [...prev, ...res.data.threads];
        return merged.filter(
          (thread, index, self) =>
            index === self.findIndex((t) => t._id === thread._id)
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
      borderRight: "1px solid #ddd",
      minHeight: 0,
    },
    header: {
      padding: "16px",
      fontWeight: 600,
      fontSize: 18,
      color: "#0a0a0aff",
      backgroundColor: "rgba(240, 243, 247, 0.97)",
      flexShrink: 0,
    },
    list: {
      flex: 1,
      overflowY: "auto",
      minHeight: 0,
      scrollbarWidth: "none", // Firefox
      msOverflowStyle: "none", // IE / old Edge
    },
    thread: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 16px",
      borderBottom: "1px solid #eee",
      cursor: "pointer",
      transition: "background 0.2s ease",
    },
    activeThread: {
      backgroundColor: "#0078ff",
      color: "#fff",
    },
    threadText: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
    },
    meta: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      fontSize: 12,
      color: "#555",
    },
    badge: {
      backgroundColor: "#ff4d4f",
      color: "#fff",
      borderRadius: "50%",
      width: 18,
      height: 18,
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
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>Messages</div>

      {/* Scroll Area */}
      <div style={styles.list} className="hide-scrollbar">
        {threads.map((t) => {
          const isActive = activeThread?._id === t._id;

          return (
            <div
              key={t._id}
              style={{
                ...styles.thread,
                ...(isActive ? styles.activeThread : {}),
              }}
              onClick={() => onSelect(t)}
            >
              <div style={styles.threadText}>
                <strong>{t.userName}</strong>
                <p style={{ margin: 0, fontSize: 13 }}>{t.lastMessage}</p>
              </div>

              <div style={styles.meta}>
                {/* ✅ Guard against null lastMessageAt */}
                {t.lastMessageAt && (
                  <span>
                    {new Date(t.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {t.unreadForAdmin > 0 && (
                  <span style={styles.badge}>{t.unreadForAdmin}</span>
                )}
              </div>
            </div>
          );
        })}

        <div ref={loaderRef} style={styles.loader}>
          {loading && "Loading..."}
        </div>
      </div>
    </div>
  );
};

export default InboxList;
