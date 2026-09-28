import React, { useState, useEffect } from "react";
import API from "../../api/api";
import "../shared/AdminShared.css";
import InfiniteScrollSentinel from "../../components/InfiniteScrollSentinel";

const POSTS_PER_PAGE = 10;

const DeletePost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // append=true adds the next page under the current rows (infinite scroll)
  const fetchPosts = async (page, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");

      const res = await API.get("/posts", {
        params: { page, limit: POSTS_PER_PAGE },
      });

      setPosts((prev) => {
        if (!append) return res.data.posts;
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.data.posts.filter((p) => !seen.has(p.id))];
      });
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload every page currently shown (after edit / delete)
  const refreshPosts = async () => {
    try {
      let all = [];
      let total = 1;
      for (let pg = 1; pg <= currentPage; pg++) {
        const res = await API.get("/posts", { params: { page: pg, limit: POSTS_PER_PAGE } });
        all = all.concat(res.data.posts);
        total = res.data.totalPages;
      }
      setPosts(all);
      setTotalPages(total);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load posts");
    }
  };

  const loadMorePosts = () => {
    if (loading || loadingMore || currentPage >= totalPages) return;
    fetchPosts(currentPage + 1, true);
  };

  const handleDelete = async (post) => {
    const confirmed = window.confirm(
      `Delete "${post.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(post.id);
      setError("");

      await API.delete(`/posts/${post.id}`);

      await refreshPosts();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete post");
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
        <h2>Delete Posts</h2>

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
                  <tr key={post.id}>
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
                        onClick={() => handleDelete(post)}
                        disabled={deletingId === post.id}
                        style={{
                          padding: "6px 12px",
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: deletingId === post.id ? "not-allowed" : "pointer",
                          fontSize: "13px",
                        }}
                      >
                        {deletingId === post.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <InfiniteScrollSentinel
              hasMore={currentPage < totalPages}
              loading={loadingMore}
              onLoadMore={loadMorePosts}
              text="Loading more..."
            />
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

export default DeletePost;