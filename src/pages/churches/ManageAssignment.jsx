import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unassigningId, setUnassigningId] = useState(null);

  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Matches GET /api/churches/assignments -> getAssignments
      const res = await API.get("/churches/assignments");
      setAssignments(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // "Unassign" = remove the assignment record entirely. There's no
  // PATCH route on the backend, only DELETE, so unassigning a
  // user/church pairing means deleting that ChurchAssignment doc
  // (matches DELETE /api/churches/assignment/:id -> deleteAssignment).
  const handleUnassign = async (id, personLabel, churchLabel) => {
    const confirmed = window.confirm(
      `Unassign ${personLabel} from ${churchLabel}?`
    );
    if (!confirmed) return;

    try {
      setUnassigningId(id);

      const token = localStorage.getItem("token");

      await API.delete(`/churches/assignment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to unassign");
    } finally {
      setUnassigningId(null);
    }
  };

  if (loading) return <p style={{ padding: "30px" }}>Loading assignments...</p>;

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
          <h2 style={{ margin: 0 }}>Church Assignments</h2>
          <button
            onClick={() => navigate("/admin/assignments/new")}
            style={{
              padding: "10px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            + New Assignment
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {assignments.length === 0 && !error && <p>No assignments yet.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assignments.map((a) => {
            const personLabel = a.user?.name || a.user?.username || a.user?.email || "Unknown user";
            const churchLabel = a.church?.churchName || "Unknown church";

            return (
              <div
                key={a._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                }}
              >
                <div>
                  <strong>{personLabel}</strong>
                  <span style={{ color: "#64748b" }}> — {a.role}</span>
                  <span style={{ color: "#64748b" }}> @ {churchLabel}</span>

                  <div style={{ marginTop: "4px" }}>
                    {a.isCurrent && (
                      <span
                        style={{
                          fontSize: "12px",
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          marginRight: "6px",
                        }}
                      >
                        Current
                      </span>
                    )}
                    {a.isPrimary && (
                      <span
                        style={{
                          fontSize: "12px",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          padding: "2px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        Primary (featured leader)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleUnassign(a._id, personLabel, churchLabel)}
                  disabled={unassigningId === a._id}
                  style={{
                    padding: "8px 14px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {unassigningId === a._id ? "Unassigning..." : "Unassign"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManageAssignments;