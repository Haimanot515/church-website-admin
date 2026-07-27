import React, { useState, useEffect } from "react";
import API from "../../api/api";

const DeleteCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(category._id);
      setError("");

      await API.delete(`/categories/${category._id}`);

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
        <h2>Delete Categories</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

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
                <tr key={cat._id}>
                  <td style={tdStyle}>{cat.name}</td>
                  <td style={tdStyle}>{cat.description || "—"}</td>
                  <td style={tdStyle}>
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
                      }}
                    >
                      {deletingId === cat._id ? "Deleting..." : "Delete"}
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

export default DeleteCategory;