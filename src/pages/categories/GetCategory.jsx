import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const emptyForm = {
  name: "",
  description: "",
  language: "",
};

const GetCategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  // Which language's categories the admin is currently viewing.
  // Since the admin api.js sends no Accept-Language header on its own,
  // this dropdown is the ONLY thing that decides which language gets fetched.
  const [filterLanguageCode, setFilterLanguageCode] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  // Load the language list once, then default the viewing filter to the
  // first one available
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        const langData = Array.isArray(res.data) ? res.data : res.data.languages;
        setLanguages(langData || []);

        if (langData && langData.length > 0) {
          setFilterLanguageCode(langData[0].code);
        }
      } catch (err) {
        console.log(err);
        setError("Failed to load languages");
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  // Re-fetch categories whenever the viewing language changes
  useEffect(() => {
    if (!filterLanguageCode) return;
    fetchCategories(filterLanguageCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLanguageCode]);

  const fetchCategories = async (languageCode) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/categories", {
        headers: { "Accept-Language": languageCode },
      });

      setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageLabel = (languageId) => {
    const match = languages.find((l) => l._id === languageId);
    return match ? `${match.name} (${match.code})` : "—";
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (category) => {
    setEditingId(category._id);
    setFormError("");
    setForm({
      name: category.name || "",
      description: category.description || "",
      language: category.language || "",
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

      await API.put(`/categories/${editingId}`, {
        name: form.name,
        description: form.description,
        language: form.language,
      });

      alert("Category updated successfully");
      handleCancelEdit();
      await fetchCategories(filterLanguageCode);
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(category._id);

      await API.delete(`/categories/${category._id}`);

      if (editingId === category._id) {
        handleCancelEdit();
      }

      await fetchCategories(filterLanguageCode);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

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
            marginBottom: "10px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2 style={{ margin: 0 }}>All Categories</h2>

          {!editingId && (
            <button
              onClick={() => navigate("/admin/categories/create")}
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
              + New Category
            </button>
          )}
        </div>

        {!editingId && (
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <label htmlFor="viewing-language" style={{ fontSize: "14px", color: "#555" }}>
              Viewing categories in:
            </label>
            <select
              id="viewing-language"
              value={filterLanguageCode}
              onChange={(e) => setFilterLanguageCode(e.target.value)}
              disabled={languagesLoading}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              {languages.map((lang) => (
                <option key={lang._id} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>
        )}

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
            <h3 style={{ marginTop: 0 }}>Edit Category</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="name"
                placeholder="Category Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Category Description"
                value={form.description}
                onChange={handleChange}
                rows="5"
              />

              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                required
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="" disabled>
                  Select a language
                </option>
                {languages.map((lang) => (
                  <option key={lang._id} value={lang._id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

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
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found for this language.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "15px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Language</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td style={tdStyle}>{cat.name}</td>
                      <td style={tdStyle}>{cat.description || "—"}</td>
                      <td style={tdStyle}>{getLanguageLabel(cat.language)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEditClick(cat)}
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
                            onClick={() => handleDelete(cat)}
                            disabled={deletingId === cat._id}
                            style={{
                              padding: "6px 12px",
                              background: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: deletingId === cat._id ? "not-allowed" : "pointer",
                              fontSize: "13px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {deletingId === cat._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default GetCategory;