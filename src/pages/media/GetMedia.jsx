import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const emptyForm = {
  title: "",
  description: "",
  type: "photo",
  status: "draft",
  category: "",
  file: null,
};

const getAcceptForType = (type) => {
  if (type === "photo") return "image/*";
  if (type === "video") return "video/*";
  if (type === "audio") return "audio/*";
  if (type === "document") return "application/pdf";
  return "*/*";
};

const typeBadgeStyle = (type) => {
  const colors = {
    photo: { bg: "#dbeafe", text: "#1d4ed8" },
    video: { bg: "#fce7f3", text: "#be185d" },
    audio: { bg: "#ede9fe", text: "#6d28d9" },
    document: { bg: "#fef3c7", text: "#92400e" },
  };

  const c = colors[type] || { bg: "#e5e7eb", text: "#374151" };

  return {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    background: c.bg,
    color: c.text,
    textTransform: "capitalize",
  };
};

const GetMedia = () => {
  const navigate = useNavigate();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const catRes = await API.get("/categories");
        setCategories(catRes.data);
      } catch (err) {
        console.log(err);
        setError((prev) => prev || "Failed to load categories");
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Revoke the object URL whenever the preview changes or we unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend returns a plain array — no pagination on this endpoint yet
      const res = await API.get("/media");

      setMedia(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormError("");
    setForm({
      title: item.title || "",
      description: item.description || "",
      type: item.mediaType || "photo",
      status: item.status || "draft",
      category: item.category?._id || "",
      file: null,
    });
    setExistingUrl(item.mediaUrl || "");
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setExistingUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, file }));
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
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("status", form.status);
      formData.append("category", form.category);

      if (form.file) {
        formData.append("file", form.file);
      }

      await API.put(`/media/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Media updated successfully");
      handleCancelEdit();
      await fetchMedia();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update media");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item._id);

      await API.delete(`/media/${item._id}`);

      if (editingId === item._id) {
        handleCancelEdit();
      }

      await fetchMedia();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  const renderThumb = (item) => {
    if (item.mediaType === "photo" && item.mediaUrl) {
      return (
        <img
          src={item.mediaUrl}
          alt={item.title}
          style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "6px" }}
        />
      );
    }

    if (item.thumbnail) {
      return (
        <img
          src={item.thumbnail}
          alt={item.title}
          style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "6px" }}
        />
      );
    }

    if (item.mediaUrl) {
      return (
        <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px" }}>
          View file
        </a>
      );
    }

    return <span style={{ color: "#94a3b8" }}>—</span>;
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
          <h2 style={{ margin: 0 }}>All Media</h2>

          {!editingId && (
            <button
              onClick={() => navigate("/admin/media/create")}
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
              + New Media
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
            <h3 style={{ marginTop: 0 }}>Edit Media</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="title"
                placeholder="Media title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Media description"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />

              <select name="type" value={form.type} onChange={handleChange}>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Book / PDF</option>
              </select>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={optionsLoading}
              >
                <option value="">
                  {optionsLoading ? "Loading categories..." : "Select Category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Save as Draft</option>
                <option value="published">Publish</option>
              </select>

              <input
                type="file"
                accept={getAcceptForType(form.type)}
                onChange={handleFileChange}
              />
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                Leave empty to keep the current file.
              </p>

              {preview && form.type === "photo" && (
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
                />
              )}
              {preview && form.type === "video" && (
                <video src={preview} controls style={{ width: "100%" }} />
              )}
              {preview && form.type === "audio" && <audio src={preview} controls />}
              {preview && form.type === "document" && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                  <iframe src={preview} title="PDF preview" style={{ width: "100%", height: "350px", border: "none" }} />
                </div>
              )}

              {!preview && existingUrl && form.type === "photo" && (
                <img
                  src={existingUrl}
                  alt="current"
                  style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
                />
              )}
              {!preview && existingUrl && (form.type === "video" || form.type === "audio" || form.type === "document") && (
                <a href={existingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px" }}>
                  View current file
                </a>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting || optionsLoading}
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
            <p>Loading media...</p>
          ) : media.length === 0 ? (
            <p>No media found.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "15px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>File</th>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Created</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map((item) => (
                    <tr key={item._id}>
                      <td style={tdStyle}>{renderThumb(item)}</td>
                      <td style={tdStyle}>{item.title}</td>
                      <td style={tdStyle}>
                        <span style={typeBadgeStyle(item.mediaType)}>{item.mediaType}</span>
                      </td>
                      <td style={tdStyle}>{item.category?.name || "—"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: item.status === "published" ? "#dcfce7" : "#fef9c3",
                            color: item.status === "published" ? "#166534" : "#854d0e",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEditClick(item)}
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
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item._id}
                            style={{
                              padding: "6px 12px",
                              background: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: deletingId === item._id ? "not-allowed" : "pointer",
                              fontSize: "13px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {deletingId === item._id ? "Deleting..." : "Delete"}
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

export default GetMedia;