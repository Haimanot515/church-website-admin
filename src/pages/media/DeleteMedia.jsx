import React, { useState, useEffect } from "react";
import API from "../../api/api";

const typeBadgeStyle = (type) => {
  const colors = {
    photo: { bg: "#dbeafe", text: "#1d4ed8" },
    video: { bg: "#fce7f3", text: "#be185d" },
    audio: { bg: "#ede9fe", text: "#6d28d9" },
    document: { bg: "#fef3c7", text: "#92400e" },
  };

  const c = colors[type] || { bg: "#e5e7eb", text: "#374151" };

  return {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    background: c.bg,
    color: c.text,
    textTransform: "capitalize",
  };
};

const DeleteMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend returns a plain array — no pagination on this endpoint yet
      const res = await API.get("/media");

      setMedia(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      setError("");

      await API.delete(`/media/${item._id}`);

      await fetchMedia();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h2>Delete Media</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p>Loading media...</p>
        ) : media.length === 0 ? (
          <p>No media found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {media.map((item) => (
                <tr key={item._id}>
                  <td style={tdStyle}>{item.title}</td>
                  <td style={tdStyle}>
                    <span style={typeBadgeStyle(item.mediaType)}>{item.mediaType}</span>
                  </td>
                  <td style={tdStyle}>{item.category?.name || "—"}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: item.status === "published" ? "#dcfce7" : "#fef9c3",
                        color: item.status === "published" ? "#166534" : "#854d0e",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item._id}
                      style={{
                        padding: "6px 12px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: deletingId === item._id ? "not-allowed" : "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {deletingId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "2px solid #e2e8f0",
  fontSize: "13px",
  color: "#555",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
};

export default DeleteMedia;