import React, { useState, useEffect } from "react";
import API from "../../api/api";

const POSTS_PER_PAGE = 10;

const emptyForm = {
  title: "",
  description: "",
  content: "",
  category: "",
  language: "",
  isTrending: false,
  isFeatured: false,
  isRecommended: false,
  status: "draft",
  image: null,
};

const UpdatePost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchPosts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, langRes] = await Promise.all([
          API.get("/categories"),
          API.get("/languages"),
        ]);
        setCategories(catRes.data);
        setLanguages(langRes.data);
      } catch (err) {
        console.log(err);
        setError((prev) => prev || "Failed to load categories or languages");
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const fetchPosts = async (page) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/posts", {
        params: { page, limit: POSTS_PER_PAGE },
      });

      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleEditClick = (post) => {
    setEditingId(post._id);
    setFormError("");
    setForm({
      title: post.title || "",
      description: post.description || "",
      content: post.content || "",
      category: post.category?._id || "",
      language: post.language?._id || "",
      isTrending: !!post.isTrending,
      isFeatured: !!post.isFeatured,
      isRecommended: !!post.isRecommended,
      status: post.status || "draft",
      image: null,
    });
    setExistingImageUrl(post.imageUrl || "");
    setPreview(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setExistingImageUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("language", form.language);
      formData.append("isTrending", form.isTrending);
      formData.append("isFeatured", form.isFeatured);
      formData.append("isRecommended", form.isRecommended);
      formData.append("status", form.status);

      if (form.image) {
        formData.append("image", form.image);
      }

      await API.put(`/posts/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Post updated successfully");
      handleCancelEdit();
      await fetchPosts(currentPage);
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update post");
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
        <h2>Update Posts</h2>

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
            <h3 style={{ marginTop: 0 }}>Edit Post</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="title"
                placeholder="Post title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Post description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                required
              />

              <textarea
                name="content"
                placeholder="Post content"
                value={form.content}
                onChange={handleChange}
                rows="8"
                required
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
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

              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                required
                disabled={optionsLoading}
              >
                <option value="">
                  {optionsLoading ? "Loading languages..." : "Select Language"}
                </option>
                {languages.map((lang) => (
                  <option key={lang._id} value={lang._id}>
                    {lang.name}
                  </option>
                ))}
              </select>

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {(preview || existingImageUrl) && (
                <img
                  src={preview || existingImageUrl}
                  alt="preview"
                  style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
                />
              )}

              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <label>
                <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleChange} />
                Trending
              </label>

              <label>
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                Featured
              </label>

              <label>
                <input type="checkbox" name="isRecommended" checked={form.isRecommended} onChange={handleChange} />
                Recommended
              </label>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={submitting || optionsLoading}
                  style={{
                    display: "inline-block",
                    padding: "14px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: submitting || optionsLoading ? "not-allowed" : "pointer",
                    flex: 1,
                    minWidth: "120px",
                    fontSize: "14px",
                    fontWeight: 600,
                    opacity: submitting || optionsLoading ? 0.6 : 1,
                    visibility: "visible",
                  }}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  style={{
                    display: "inline-block",
                    padding: "14px",
                    background: "#e5e7eb",
                    color: "#334155",
                    border: "none",
                    borderRadius: "10px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    flex: 1,
                    minWidth: "120px",
                    fontSize: "14px",
                    fontWeight: 600,
                    opacity: submitting ? 0.6 : 1,
                    visibility: "visible",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto", marginTop: "15px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Language</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Author</th>
                    <th style={thStyle}>Created</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post._id} style={editingId === post._id ? { background: "#eff6ff" } : undefined}>
                      <td style={tdStyle}>{post.title}</td>
                      <td style={tdStyle}>{post.category?.name || "—"}</td>
                      <td style={tdStyle}>{post.language?.name || "—"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: post.status === "published" ? "#dcfce7" : "#fef9c3",
                            color: post.status === "published" ? "#166534" : "#854d0e",
                          }}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td style={tdStyle}>{post.author?.name || "—"}</td>
                      <td style={tdStyle}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleEditClick(post)}
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            minWidth: "60px",
                            visibility: "visible",
                            opacity: 1,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          </>
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

const pageButtonStyle = (disabled) => ({
  padding: "8px 16px",
  background: disabled ? "#e5e7eb" : "#2563eb",
  color: disabled ? "#999" : "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default UpdatePost;