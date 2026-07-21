import React, { useState, useEffect } from "react";
import API from "../../api/api";

const AdminHomeHero = () => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    quote: "",
    name: "",
    role: "",
    story: "", // 🆕 Added field
  });
  const [image, setImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null); // 🆕 Added state
  const [preview, setPreview] = useState(null); 
  const [storyPreview, setStoryPreview] = useState(null); // 🆕 Added preview
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load existing data from the plural 'homeheros' collection
  useEffect(() => {
    const fetchHero = async () => {
      try {
        // UPDATED: Now uses plural route /homeheros
        const res = await API.get("/homeheros");
        if (res.data) {
          setFormData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            description: res.data.description || "",
            quote: res.data.quote || "",
            name: res.data.name || "",
            role: res.data.role || "",
            story: res.data.story || "", // 🆕 Sync with DB
          });
          
          if (res.data.image) setPreview(res.data.image);
          if (res.data.storyImage) setStoryPreview(res.data.storyImage);
        }
      } catch (err) {
        console.log("No existing homeheros data found or collection dropped.");
      }
    };
    fetchHero();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    setLoading(true);
    setMessage("");

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (image) data.append("image", image);
    if (storyImage) data.append("storyImage", storyImage); // 🆕 Append story image

    try {
      // UPDATED: Now posts to plural route /homeheros
      const res = await API.post("/homeheros", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Portfolio home hero refreshed and updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error updating homeheros");
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

  const labelStyle = { fontWeight: "600", marginBottom: "5px", display: "block" };

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: "5px" }}>Manage Portfolio Home Hero</h2>
      <p style={{fontSize: "12px", color: "#e63946", marginBottom: "20px"}}>
        * Note: Saving will DROP all existing records in 'homeheros' and create a fresh one.
      </p>
      
      {message && (
        <div style={{ padding: "10px", backgroundColor: "#f0f7ff", borderLeft: "4px solid #0070f3", marginBottom: "20px", color: "#0070f3", fontWeight: "600" }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label style={labelStyle}>Hero Title</label>
        <input name="title" value={formData.title} onChange={handleChange} style={inputStyle} required />


        <label style={labelStyle}>Main Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, height: "80px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Job Role</label>
            <input name="role" value={formData.role} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}>My Story (Detailed Bio)</label>
        <textarea name="story" value={formData.story} onChange={handleChange} style={{ ...inputStyle, height: "120px" }} placeholder="Detailed story for about section..." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>Hero Profile Image</label>
            <input type="file" onChange={(e) => handleFileChange(e, "hero")} style={inputStyle} accept="image/*" />
            {preview && <img src={preview} alt="Hero" style={{ width: "100px", borderRadius: "8px" }} />}
          </div>
          <div>
            <label style={labelStyle}>Story/About Image</label>
            <input type="file" onChange={(e) => handleFileChange(e, "story")} style={inputStyle} accept="image/*" />
            {storyPreview && <img src={storyPreview} alt="Story" style={{ width: "100px", borderRadius: "8px" }} />}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "15px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}
        >
          {loading ? "Wiping & Replacing Data..." : "Update Home Hero"}
        </button>
      </form>
    </div>
  );
};

export default AdminHomeHero;
