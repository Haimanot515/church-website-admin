import React, { useState, useEffect } from "react";
import API from "../../api/api";

const POSTS_PER_PAGE = 10;

const GetPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPosts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchPosts = async (page) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/posts", {
        params: {
          page,
          limit: POSTS_PER_PAGE,
        },
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setDeletingId(id);

      await API.delete(`/posts/${id}`);

      // Refetch current page so the count/pagination stays accurate
      await fetchPosts(currentPage);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
        <h2>All Posts</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
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
                  <tr key={post._id}>
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
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingId === post._id}
                        style={{
                          padding: "6px 12px",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        {deletingId === post._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

export default GetPost;