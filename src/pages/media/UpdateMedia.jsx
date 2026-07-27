import React, { useState, useEffect } from "react";
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

const UpdateMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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
        <h2>Update Media</h2>

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

        {loading ? (
          <p>Loading media...</p>
        ) : media.length === 0 ? (
          <p>No media found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
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
                <tr key={item._id} style={editingId === item._id ? { background: "#eff6ff" } : undefined}>
                  <td style={tdStyle}>{item.title}</td>
                  <td style={tdStyle}>{item.mediaType}</td>
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

export default UpdateMedia;