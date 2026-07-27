import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const emptyForm = {
  name: "",
  description: "",
};

const GetCategory = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

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

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (category) => {
    setEditingId(category._id);
    setFormError("");
    setForm({
      name: category.name || "",
      description: category.description || "",
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

      await fetchCategories();
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
            <p>No categories found.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "15px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td style={tdStyle}>{cat.name}</td>
                      <td style={tdStyle}>{cat.description || "—"}</td>
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