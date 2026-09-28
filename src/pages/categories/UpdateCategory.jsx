import React, { useState, useEffect } from "react";
import API from "../../api/api";
import "../shared/AdminShared.css";

import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";

// Fields are stored as rich-text HTML — strip tags for plain-text checks and list display
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const emptyForm = {
  name: "",
  description: "",
};

const UpdateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/categories");

      setCategories(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingId(category.id);
    setFormError("");
    setForm({
      name: category.name || "",
      description: category.description || "",
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

    if (!stripHtml(form.name)) {
      setFormError("Name is required");
      return;
    }

    try {
      setSubmitting(true);

      await API.put(`/categories/${editingId}`, {
        name: form.name,
        description: form.description,
      });

      alert("Category updated successfully");
      handleCancelEdit();
      await fetchCategories();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update category");
    } finally {
      setSubmitting(false);
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
        <h2>Update Categories</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {editingId && (
          <div
            className="rte-page-shell"
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px",
              background: "#f8fafc",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Edit Category</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <RichTextProvider>
              <div className="rte-editor-shell">
                <RichTextToolbar />
                <RichTextContextMenu />
                <div className="rte-scroll-area">
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <RichTextField
                    id="ur-name"
                    value={form.name}
                    onChange={(html) => setForm((prev) => ({ ...prev, name: html }))}
                    placeholder="Category Name"
                    minHeight="44px"
                    toolbar="minimal"
                  />
    
                  <RichTextField
                    id="ur-description"
                    value={form.description}
                    onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                    placeholder="Category Description"
                    minHeight="140px"
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
              </div>
            </RichTextProvider>
          </div>
        )}

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={editingId === cat.id ? { background: "#eff6ff" } : undefined}>
                  <td style={tdStyle}>{stripHtml(cat.name)}</td>
                  <td style={tdStyle}>{stripHtml(cat.description) || "—"}</td>
                  <td style={tdStyle}>
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

export default UpdateCategory;