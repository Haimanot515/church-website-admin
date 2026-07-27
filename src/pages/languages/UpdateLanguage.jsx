import React, { useState, useEffect } from "react";
import API from "../../api/api";

const emptyForm = {
  name: "",
  code: "",
};

const UpdateLanguage = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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

  const handleEditClick = (language) => {
    setEditingId(language._id);
    setFormError("");
    setForm({
      name: language.name || "",
      code: language.code || "",
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
        <h2>Update Languages</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {editingId && (
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px",
              background: "#f8fafc",
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
                <tr key={lang._id} style={editingId === lang._id ? { background: "#eff6ff" } : undefined}>
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
                      onClick={() => handleEditClick(lang)}
                      style={{
                        padding: "6px 12px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Edit
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

export default UpdateLanguage;