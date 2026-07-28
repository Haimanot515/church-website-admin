import React, { useState } from "react";
import API from "../../api/api";

const CreateAbout = () => {
  const [about, setAbout] = useState({
    title: "",
    churchLeader: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAbout({ ...about, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAbout({ ...about, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", about.title);
      formData.append("churchLeader", about.churchLeader);
      formData.append("description", about.description);

      if (about.image) {
        formData.append("image", about.image);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/about", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("About entry created successfully");

      setAbout({
        title: "",
        churchLeader: "",
        description: "",
        image: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to create About entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px" }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h2>Create About</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={about.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="churchLeader"
            placeholder="Church Leader"
            value={about.churchLeader}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={about.description}
            onChange={handleChange}
            rows="8"
            required
          />

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "Create About"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAbout;