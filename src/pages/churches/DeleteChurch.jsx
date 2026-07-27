import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

const DeleteChurch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [church, setChurch] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load the church so the admin can confirm what they're deleting
  useEffect(() => {
    const fetchChurch = async () => {
      try {
        const res = await API.get(`/churches/${id}`);
        setChurch(res.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load church");
      } finally {
        setFetching(false);
      }
    };

    fetchChurch();
  }, [id]);

  const handleDelete = async () => {
    setError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/churches/:id in churchRoutes.js
      await API.delete(`/churches/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Church deleted successfully");
      navigate("/admin/churches");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete church");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p style={{ padding: "30px" }}>Loading church...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px" }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h2>Delete Church</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {church && (
          <>
            <p style={{ color: "#334155" }}>
              Are you sure you want to delete this church? This action cannot
              be undone.
            </p>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                margin: "20px 0",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {church.image && (
                <img
                  src={church.image}
                  alt={church.churchName}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              )}

              <h3 style={{ margin: 0 }}>{church.churchName}</h3>
              <p style={{ margin: 0, color: "#64748b" }}>
                {church.shortDescription}
              </p>
              <p style={{ margin: 0, color: "#64748b" }}>{church.address}</p>
              <p style={{ margin: 0, color: "#64748b" }}>
                {church.serviceDays} — {church.serviceTime}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                {loading ? "Deleting..." : "Yes, Delete Church"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/churches")}
                style={{
                  padding: "14px",
                  background: "#e2e8f0",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteChurch;