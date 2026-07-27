import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const emptyForm = {
  name: "",
  code: "",
};

const GetLanguage = () => {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

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

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (language) => {
    setEditingId(language._id);
    setFormError("");
    setForm({
      name: language.name || "",
      code: language.code || "",
    });

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      await API.put(`/languages/${editingId}`, {
        name: form.name,
        code: form.code.toUpperCase(),
      });

      alert("Language updated successfully");
      handleCancelEdit();
      await fetchLanguages();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update language");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (language) => {
    const confirmed = window.confirm(
      `Delete "${language.name}" (${language.code})? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(language._id);

      await API.delete(`/languages/${language._id}`);

      if (editingId === language._id) {
        handleCancelEdit();
      }

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ margin: 0 }}>All Languages</h2>

          {!editingId && (
            <button
              onClick={() => navigate("/admin/languages/create")}
              style={{
                padding: "10px 18px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              + New Language
            </button>
          )}
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {editingId && (
          <div
            ref={editPanelRef}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px",
              background: "#f8fafc",
              scrollMarginTop: "20px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Edit Language</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="name"
                placeholder="Language Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="code"
                placeholder="Language Code (EN, AM, IT)"
                value={form.code}
                onChange={handleChange}
                required
                style={{ textTransform: "uppercase" }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "14px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  style={{
                    padding: "14px",
                    background: "#e5e7eb",
                    color: "#334155",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId &&
          (loading ? (
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEditClick(lang)}
                          style={{
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Edit
                        </button>

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
                            whiteSpace: "nowrap",
                          }}
                        >
                          {deletingId === lang._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
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

export default GetLanguage;