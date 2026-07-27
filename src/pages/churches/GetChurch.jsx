import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const GetChurch = () => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchChurches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/churches");
      setChurches(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load churches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  const handleDelete = async (id, churchName) => {
    const confirmed = window.confirm(
      `Delete "${churchName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/churches/:id in churchRoutes.js
      await API.delete(`/churches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove locally instead of refetching everything
      setChurches((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to delete church");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p style={{ padding: "30px" }}>Loading churches...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px" }}>
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Churches</h2>
          <button
            onClick={() => navigate("/admin/churches/new")}
            style={{
              padding: "10px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            + New Church
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {churches.length === 0 && !error && <p>No churches yet.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {churches.map((c) => (
            <div
              key={c._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.churchName}
                    style={{
                      width: "56px",
                      height: "56px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
                <div>
                  <strong>{c.churchName}</strong>
                  {c.isPrimary && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      Main Church
                    </span>
                  )}
                  {c.isFeatured && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        background: "#fef3c7",
                        color: "#92400e",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      Featured
                    </span>
                  )}
                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    {c.address}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => navigate(`/admin/churches/${c._id}/edit`)}
                  style={{
                    padding: "8px 14px",
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id, c.churchName)}
                  disabled={deletingId === c._id}
                  style={{
                    padding: "8px 14px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {deletingId === c._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetChurch;