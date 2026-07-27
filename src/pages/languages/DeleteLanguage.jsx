import React, { useState, useEffect } from "react";
import API from "../../api/api";

const DeleteLanguage = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/languages");

      setLanguages(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load languages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (language) => {
    const confirmed = window.confirm(
      `Delete "${language.name}" (${language.code})? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(language._id);
      setError("");

      await API.delete(`/languages/${language._id}`);

      await fetchLanguages();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete language");
    } finally {
      setDeletingId(null);
    }
  };

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
        <h2>Delete Languages</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p>Loading languages...</p>
        ) : languages.length === 0 ? (
          <p>No languages found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <tr key={lang._id}>
                  <td style={tdStyle}>{lang.name}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#e0e7ff",
                        color: "#3730a3",
                      }}
                    >
                      {lang.code}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(lang)}
                      disabled={deletingId === lang._id}
                      style={{
                        padding: "6px 12px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: deletingId === lang._id ? "not-allowed" : "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {deletingId === lang._id ? "Deleting..." : "Delete"}
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

export default DeleteLanguage;