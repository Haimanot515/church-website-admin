import React, { useState } from "react";
import InboxList from "./InboxList";
import ChatWindow from "./ChatWindow";

const AdminMessages = () => {
  const [activeThread, setActiveThread] = useState(null);

  const styles = {
    container: {
      position: "fixed",      // 👈 FLOAT ABOVE EVERYTHING
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "row",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f5f6f8",
      zIndex: 9999,            // 👈 VERY IMPORTANT
    },
    inbox: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #ddd",
      backgroundColor: "#ffffff",
      overflowY: "auto",
      minHeight: 0,
    },
    chat: {
      flex: 2,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#e6f0ff",
      minHeight: 0,
    },
    emptyChat: {
      flex: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      color: "#555",
      backgroundColor: "#e6f0ff",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.inbox}>
        <InboxList
          onSelect={setActiveThread}
          activeThread={activeThread}
        />
      </div>

      {activeThread ? (
        <div style={styles.chat}>
          <ChatWindow thread={activeThread} />
        </div>
      ) : (
        <div style={styles.emptyChat}>
          Select a conversation
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
