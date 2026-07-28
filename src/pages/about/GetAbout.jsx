import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const ENTRIES_PER_PAGE = 10;

const emptyForm = {
  title: "",
  churchLeader: "",
  description: "",
  image: null,
};

const GetAbout = () => {
  const navigate = useNavigate();

  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/about");
      setAllEntries(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load About entries");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(allEntries.length / ENTRIES_PER_PAGE));
  const entries = allEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (entry) => {
    setEditingId(entry._id);
    setFormError("");
    setForm({
      title: entry.title || "",
      churchLeader: entry.churchLeader || "",
      description: entry.description || "",
      image: null,
    });
    setExistingImageUrl(entry.image || "");
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setExistingImageUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("churchLeader", form.churchLeader);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("image", form.image);
      }

      await API.put(`/about/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("About entry updated successfully");
      handleCancelEdit();
      await fetchAbout();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update About entry");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this About entry?")) {
      return;
    }

    try {
      setDeletingId(id);

      await API.delete(`/about/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchAbout();

      // If deleting the last item on a page, step back a page
      const remaining = allEntries.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / ENTRIES_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete About entry");
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ margin: 0 }}>About Entries</h2>

          {!editingId && (
            <button
              onClick={() => navigate("/admin/about/create")}
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
              + New About
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
            <h3 style={{ marginTop: 0 }}>Edit About Entry</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="churchLeader"
                placeholder="Church Leader"
                value={form.churchLeader}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                required
              />

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {(preview || existingImageUrl) && (
                <img
                  src={preview || existingImageUrl}
                  alt="preview"
                  style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
                />
              )}

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
            <p>Loading About entries...</p>
          ) : allEntries.length === 0 ? (
            <p>No About entries found.</p>
          ) : (
            <>
              <div style={{ overflowX: "auto", marginTop: "15px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Title</th>
                      <th style={thStyle}>Church Leader</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Created</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry._id}>
                        <td style={tdStyle}>{entry.title}</td>
                        <td style={tdStyle}>{entry.churchLeader || "—"}</td>
                        <td style={tdStyle}>
                          {entry.description
                            ? entry.description.length > 60
                              ? `${entry.description.slice(0, 60)}...`
                              : entry.description
                            : "—"}
                        </td>
                        <td style={tdStyle}>
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditClick(entry)}
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
                              onClick={() => handleDelete(entry._id)}
                              disabled={deletingId === entry._id}
                              style={{
                                padding: "6px 12px",
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {deletingId === entry._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "25px",
                  }}
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={pageButtonStyle(currentPage === 1)}
                  >
                    Prev
                  </button>

                  <span style={{ fontSize: "14px", color: "#444" }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={pageButtonStyle(currentPage === totalPages)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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

const pageButtonStyle = (disabled) => ({
  padding: "8px 16px",
  background: disabled ? "#e5e7eb" : "#2563eb",
  color: disabled ? "#999" : "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default GetAbout;