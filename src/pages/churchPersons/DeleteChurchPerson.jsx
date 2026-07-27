import React, { useState, useEffect } from "react";
import API from "../../api/api";

const CATEGORY_LABELS = {
  leader: "Leader",
  specialThanks: "Special Thanks",
  testimony: "Testimony",
};

const DeleteChurchPerson = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/church-persons");

      setPeople(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load church persons");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (person) => {
    const confirmed = window.confirm(
      `Delete "${person.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(person._id);
      setError("");

      await API.delete(`/church-persons/${person._id}`);

      await fetchPeople();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete church person");
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
        <h2>Delete Church Persons</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p>Loading church persons...</p>
        ) : people.length === 0 ? (
          <p>No church persons found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Photo</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Role / Title</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person._id}>
                  <td style={tdStyle}>
                    {person.photos && person.photos.length > 0 ? (
                      <img
                        src={person.photos[0]}
                        alt={person.name}
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>{person.name}</td>
                  <td style={tdStyle}>{CATEGORY_LABELS[person.category] || person.category}</td>
                  <td style={tdStyle}>{person.title || person.role || "—"}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(person)}
                      disabled={deletingId === person._id}
                      style={{
                        padding: "6px 12px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: deletingId === person._id ? "not-allowed" : "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {deletingId === person._id ? "Deleting..." : "Delete"}
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

export default DeleteChurchPerson;