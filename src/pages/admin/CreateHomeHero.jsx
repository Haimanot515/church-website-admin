import React, { useState } from "react";
import API from "../../api/api";

const CreateHomeHero = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    quote: "",
    name: "",
    role: "",
    story: "",
  });

  const [image, setImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "hero") {
      setImage(file);
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setStoryImage(file);
      if (file) setStoryPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("description", formData.description);
      data.append("quote", formData.quote);
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("story", formData.story);

      if (image) {
        data.append("image", image);
      }

      if (storyImage) {
        data.append("storyImage", storyImage);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/homeheros", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Home hero created successfully");

      setFormData({
        title: "",
        subtitle: "",
        description: "",
        quote: "",
        name: "",
        role: "",
        story: "",
      });

      setImage(null);
      setStoryImage(null);
      setPreview(null);
      setStoryPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || "Failed to create home hero");
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
        <h2>Create Home Hero</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            name="title"
            placeholder="Hero title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="subtitle"
            placeholder="Hero subtitle"
            value={formData.subtitle}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Main description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />

          <textarea
            name="quote"
            placeholder="Quote"
            value={formData.quote}
            onChange={handleChange}
            rows="2"
          />

          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="role"
            placeholder="Job role"
            value={formData.role}
            onChange={handleChange}
          />

          <textarea
            name="story"
            placeholder="Detailed story for about section..."
            value={formData.story}
            onChange={handleChange}
            rows="6"
          />

          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "hero")} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
            />
          )}

          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "story")} />

          {storyPreview && (
            <img
              src={storyPreview}
              alt="story preview"
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
            {loading ? "Creating..." : "Create Home Hero"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateHomeHero;