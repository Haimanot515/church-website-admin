import React, { useState, useEffect } from "react";
import API from "../../api/api";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  quote: "",
  name: "",
  role: "",
  story: "",
};

const AdminHomeHero = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/homeheros");

      if (res.data && Object.keys(res.data).length > 0) {
        setFormData({
          title: res.data.title || "",
          subtitle: res.data.subtitle || "",
          description: res.data.description || "",
          quote: res.data.quote || "",
          name: res.data.name || "",
          role: res.data.role || "",
          story: res.data.story || "",
        });

        if (res.data.image) setPreview(res.data.image);
        if (res.data.storyImage) setStoryPreview(res.data.storyImage);
        setHasData(true);
      } else {
        setHasData(false);
      }
    } catch (err) {
      console.log(err);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setMessage("");
    setError("");

    try {
      setSubmitting(true);

      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (image) data.append("image", image);
      if (storyImage) data.append("storyImage", storyImage);

      await API.post("/homeheros", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(hasData ? "Home hero updated successfully" : "Home hero created successfully");
      setHasData(true);
      await fetchHero();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || "Failed to save home hero");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the Home Hero?")) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await API.delete("/homeheros");

      setFormData(emptyForm);
      setImage(null);
      setStoryImage(null);
      setPreview(null);
      setStoryPreview(null);
      setHasData(false);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || "Failed to delete home hero");
    } finally {
      setDeleting(false);
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
          <h2 style={{ margin: 0 }}>Home Hero</h2>
        </div>

        <p style={{ fontSize: "13px", color: "#e63946", margin: "10px 0 20px" }}>
          * Note: Saving will replace all existing Home Hero data.
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "#166534" }}>{message}</p>}

        {loading ? (
          <p>Loading home hero...</p>
        ) : (
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px",
              background: "#f8fafc",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{hasData ? "Edit Home Hero" : "Create Home Hero"}</h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="title"
                placeholder="Hero title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Main description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
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
              </div>

              <textarea
                name="story"
                placeholder="Detailed story for about section..."
                value={formData.story}
                onChange={handleChange}
                rows="6"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "6px" }}>
                    Hero Profile Image
                  </label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "hero")} />
                  {preview && (
                    <img
                      src={preview}
                      alt="Hero"
                      style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginTop: "10px" }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "6px" }}>
                    Story/About Image
                  </label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "story")} />
                  {storyPreview && (
                    <img
                      src={storyPreview}
                      alt="Story"
                      style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginTop: "10px" }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting || deleting}
                  style={{
                    padding: "14px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: submitting || deleting ? "not-allowed" : "pointer",
                    flex: 1,
                  }}
                >
                  {submitting ? "Saving..." : hasData ? "Save Changes" : "Create Home Hero"}
                </button>

                {hasData && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting || deleting}
                    style={{
                      padding: "14px",
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: submitting || deleting ? "not-allowed" : "pointer",
                      flex: 1,
                    }}
                  >
                    {deleting ? "Deleting..." : "Delete Home Hero"}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomeHero;