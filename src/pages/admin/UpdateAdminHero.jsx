import React, { useState, useEffect } from "react";
import API from "../../api/api";

const UpdateAdminHero = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    quote: "",
    name: "",
    role: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await API.get("/hero");
        if (res.data) {
          setFormData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            description: res.data.description || "",
            quote: res.data.quote || "",
            name: res.data.name || "",
            role: res.data.role || "",
          });
          // Fix: res.data.image matches your schema 'image' field
          if (res.data.image) setPreview(res.data.image);
        }
      } catch (err) {
        console.log("No existing hero data found.");
      }
    };
    fetchHero();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("subtitle", formData.subtitle);
    data.append("description", formData.description);
    data.append("quote", formData.quote);
    data.append("name", formData.name);
    data.append("role", formData.role);
    
    // IMPORTANT: Only send 'image' if a new file was actually picked
    if (image) {
      data.append("image", image);
    }

    try {
      // Use PUT to avoid triggering the 'deleteMany' (DROP) logic in POST
      const res = await API.put("/hero", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Portfolio updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error updating hero");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    display: "block",
    boxSizing: "border-box"
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Manage Portfolio Hero</h2>
      {message && <p style={{ color: "#0070f3", fontWeight: "bold" }}>{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: "bold" }}>Title</label>
        <input name="title" value={formData.title} onChange={handleChange} style={inputStyle} required />

        <label style={{ fontWeight: "bold" }}>Subtitle</label>
        <input name="subtitle" value={formData.subtitle} onChange={handleChange} style={inputStyle} />

        <label style={{ fontWeight: "bold" }}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: "100px" }} />

        <label style={{ fontWeight: "bold" }}>Full Name</label>
        <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} />

        <label style={{ fontWeight: "bold" }}>Job Role</label>
        <input name="role" value={formData.role} onChange={handleChange} style={inputStyle} />

        <label style={{ fontWeight: "bold" }}>Profile Image</label>
        <input type="file" onChange={handleFileChange} style={inputStyle} accept="image/*" />

        {preview && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <img src={preview} alt="Preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", border: "2px solid #0070f3" }} />
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default UpdateAdminHero;