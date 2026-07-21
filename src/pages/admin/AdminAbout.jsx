import React, { useState } from "react";
import API from "../../api/api";

const AdminAbout = () => {
  const [about, setAbout] = useState({
    title: "",
    description: "",
    image: null,
  });

  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", about.title);
      formData.append("description", about.description);
      if (about.image) formData.append("image", about.image);

      await API.post("/about", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("About section added successfully!");

      setAbout({
        title: "",
        description: "",
        image: null,
      });
      setPreview(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Failed to add About section");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAbout({ ...about, image: file });
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#1e293b" }}>
          Add About Section
        </h2>

        {error && (
          <p style={{ color: "red", textAlign: "center", fontWeight: "500" }}>
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            type="text"
            placeholder="Title"
            value={about.title}
            onChange={(e) =>
              setAbout({ ...about, title: e.target.value })
            }
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />

          <textarea
            placeholder="Description"
            value={about.description}
            onChange={(e) =>
              setAbout({ ...about, description: e.target.value })
            }
            required
            rows={5}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              resize: "vertical",
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          )}

          <button
            type="submit"
            style={{
              padding: "14px 20px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.background = "#2563eb")}
          >
            Add About
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAbout;