import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const emptyForm = {
  title: "",
  desc: "",
  leader: "",
  leaderRole: "",
  range: "",
  servedBy: "",
  order: 0,
  year: "",
  file: null,
};

const GetChurchStories = () => {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  const fetchStories = async (pageToLoad) => {
    try {
      setLoading(true);

      // Matches GET /api/church-story?page=&limit= -> getChurchStories
      const res = await API.get(`/church-story?page=${pageToLoad}&limit=10`);

      setStories(res.data.stories);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message || "Failed to load church story chapters"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(1);
  }, []);

  // Revoke the preview URL whenever it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (s) => {
    setEditingId(s._id);
    setFormError("");
    setForm({
      title: s.title || "",
      desc: s.desc || "",
      leader: s.leader || "",
      leaderRole: s.leaderRole || "",
      range: s.range || "",
      servedBy: s.servedBy || "",
      order: s.order ?? 0,
      year: s.year ?? "",
      file: null,
    });
    setExistingPhoto(s.photo || null);
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingPhoto(null);
    setPreview(null);
    setFormError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setForm({ ...form, file: selectedFile || null });

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
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
      formData.append("desc", form.desc);
      formData.append("leader", form.leader);
      formData.append("leaderRole", form.leaderRole);
      formData.append("range", form.range);
      formData.append("servedBy", form.servedBy);
      formData.append("order", form.order);

      // Only append year if a value was actually entered — sending an
      // empty string can fail schema validation if year is typed as a
      // Number.
      if (form.year) {
        formData.append("year", form.year);
      }

      if (form.file) {
        formData.append("photo", form.file);
      }

      // Auth header is already attached globally by the API interceptor
      // Matches PUT /api/church-story/:id -> updateChurchStory
      await API.put(`/church-story/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Church story chapter updated successfully");
      handleCancelEdit();
      await fetchStories(page);
    } catch (err) {
      console.log(err);

      setFormError(
        err.response?.data?.message || "Failed to update church story chapter"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Delete chapter "${title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      // Auth header is attached globally by the API interceptor
      await API.delete(`/church-story/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || "Failed to delete chapter");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px",
      }}
    >
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
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Church Story Chapters</h2>

          {!editingId && (
            <button
              onClick={() => navigate("/admin/church-story/create")}
              style={{
                padding: "10px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              + New Chapter
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
            <h3 style={{ marginTop: 0 }}>Edit Chapter</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="title"
                placeholder="Chapter title (e.g. The Founding Years)"
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="leader"
                placeholder="Leader name"
                value={form.leader}
                onChange={handleChange}
              />

              <input
                type="text"
                name="leaderRole"
                placeholder="Leader role (e.g. Founding Pastor)"
                value={form.leaderRole}
                onChange={handleChange}
              />

              <input
                type="text"
                name="range"
                placeholder="Years led (e.g. 1998 – 2006)"
                value={form.range}
                onChange={handleChange}
              />

              <input
                type="text"
                name="servedBy"
                placeholder="Served by / community group"
                value={form.servedBy}
                onChange={handleChange}
              />

              <input
                type="number"
                name="order"
                placeholder="Display order (lower = shown first)"
                value={form.order}
                onChange={handleChange}
                min="0"
              />

              <input
                type="number"
                name="year"
                placeholder="Sort year (used for chronological ordering)"
                value={form.year}
                onChange={handleChange}
              />

              <textarea
                name="desc"
                placeholder="Chapter description"
                rows="5"
                value={form.desc}
                onChange={handleChange}
              />

              {existingPhoto && !preview && (
                <div>
                  <small style={{ color: "#64748b" }}>Current photo:</small>
                  <br />
                  <img
                    src={existingPhoto}
                    alt="current chapter"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </div>
              )}

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {preview && (
                <div>
                  <small style={{ color: "#64748b" }}>New photo:</small>
                  <br />
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
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
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId && (
          <>
            {loading ? (
              <p>Loading chapters...</p>
            ) : (
              <>
                {stories.length === 0 && !error && <p>No chapters yet.</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {stories.map((s) => (
                    <div
                      key={s._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {s.photo && (
                          <img
                            src={s.photo}
                            alt={s.title}
                            style={{
                              width: "56px",
                              height: "56px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        )}

                        <div>
                          <strong>{s.title}</strong>
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "12px",
                              color: "#94a3b8",
                            }}
                          >
                            order: {s.order}
                            {s.year !== undefined && s.year !== null && s.year !== ""
                              ? ` · year: ${s.year}`
                              : ""}
                          </span>

                          <div style={{ color: "#64748b", fontSize: "13px" }}>
                            {s.leader && (
                              <>
                                {s.leader}
                                {s.leaderRole ? ` — ${s.leaderRole}` : ""}
                                {s.range ? ` (${s.range})` : ""}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEditClick(s)}
                          style={{
                            padding: "8px 14px",
                            background: "#e2e8f0",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(s._id, s.title)}
                          disabled={deletingId === s._id}
                          style={{
                            padding: "8px 14px",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          {deletingId === s._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "12px",
                      marginTop: "24px",
                    }}
                  >
                    <button
                      onClick={() => fetchStories(page - 1)}
                      disabled={page <= 1}
                      style={{
                        padding: "8px 14px",
                        background: "#e2e8f0",
                        border: "none",
                        borderRadius: "8px",
                        cursor: page <= 1 ? "default" : "pointer",
                        opacity: page <= 1 ? 0.5 : 1,
                      }}
                    >
                      Previous
                    </button>

                    <span style={{ color: "#475569", fontSize: "14px" }}>
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => fetchStories(page + 1)}
                      disabled={page >= totalPages}
                      style={{
                        padding: "8px 14px",
                        background: "#e2e8f0",
                        border: "none",
                        borderRadius: "8px",
                        cursor: page >= totalPages ? "default" : "pointer",
                        opacity: page >= totalPages ? 0.5 : 1,
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GetChurchStories;