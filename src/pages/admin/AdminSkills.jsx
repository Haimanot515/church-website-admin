import React, { useState, useEffect } from "react";
import API from "../../api/api.jsx";

const AdminSkills = () => {
  // --- SECTION 1: SKILL HERO STATE ---
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    description: "",
    name: "",
    role: "",
    quote: "",
    story: "",
  });
  const [heroImage, setHeroImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);

  // --- SECTION 2: INDIVIDUAL SKILL STATE ---
  const [newSkill, setNewSkill] = useState({ 
    name: "", 
    level: "Advanced",
    category: "Programming Languages" // ADDED CATEGORY DEFAULT
  });
  const [skillIcon, setSkillIcon] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Define categories to match your Skill.jsx page
  const categories = [
    "Programming Languages", "Cybersecurity", "Frontend", "Backend", "AI", "DevOps", "Mobile"
  ];

  useEffect(() => {
    API.get("/skill-hero")
      .then((res) => { if (res.data) setHeroData(res.data); })
      .catch(() => console.log("Skill Hero record is empty."));
  }, []);

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hData = new FormData();
      Object.keys(heroData).forEach(key => hData.append(key, heroData[key]));
      if (heroImage) hData.append("image", heroImage);
      if (storyImage) hData.append("storyImage", storyImage);

      await API.post("/skill-hero", hData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Skill Hero updated & collection refreshed (DROP).");
    } catch (err) {
      setMessage("❌ Hero update failed.");
    } finally { setLoading(false); }
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    setLoading(true);
    try {
      const sData = new FormData();
      sData.append("name", newSkill.name);
      sData.append("level", newSkill.level);
      sData.append("category", newSkill.category); // ADDED CATEGORY TO FORMDATA
      if (skillIcon) sData.append("image", skillIcon);

      await API.post("/skills", sData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ New skill created in table.");
      setNewSkill({ name: "", level: "Advanced", category: "Programming Languages" });
      setSkillIcon(null);
    } catch (err) {
      setMessage("❌ Skill creation failed.");
    } finally { setLoading(false); }
  };

  const cardStyle = { background: "#fff", padding: "30px", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "25px" };
  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", marginBottom: "12px" };
  const labelStyle = { fontWeight: "bold", fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", fontWeight: "900" }}>Manage Skills Page</h1>
      {message && <div style={{ background: "#f0f7ff", color: "#0070f3", padding: "12px", borderRadius: "8px", textAlign: "center", marginBottom: "20px" }}>{message}</div>}

      {/* FORM 1: THE HERO */}
      <div style={cardStyle}>
        <h3 style={{ color: "#2563eb", marginTop: "0" }}>1. Configure Skill Hero</h3>
        <form onSubmit={handleHeroSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input placeholder="Title" value={heroData.title} onChange={(e) => setHeroData({...heroData, title: e.target.value})} style={inputStyle} />
            <input placeholder="Subtitle" value={heroData.subtitle} onChange={(e) => setHeroData({...heroData, subtitle: e.target.value})} style={inputStyle} />
          </div>
          <br />
          <textarea placeholder="Hero Description" value={heroData.description} onChange={(e) => setHeroData({...heroData, description: e.target.value})} style={{...inputStyle, height: "80px"}} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input placeholder="Name" value={heroData.name} onChange={(e) => setHeroData({...heroData, name: e.target.value})} style={inputStyle} />
            <input placeholder="Role" value={heroData.role} onChange={(e) => setHeroData({...heroData, role: e.target.value})} style={inputStyle} />
          </div>

          <input placeholder="Personal Quote" value={heroData.quote} onChange={(e) => setHeroData({...heroData, quote: e.target.value})} style={inputStyle} />
          <br />
          <textarea placeholder="Story Content" value={heroData.story} onChange={(e) => setHeroData({...heroData, story: e.target.value})} style={{...inputStyle, height: "100px"}} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Hero Main Image</label>
              <input type="file" onChange={(e) => setHeroImage(e.target.files[0])} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Story/Layout Image</label>
              <input type="file" onChange={(e) => setStoryImage(e.target.files[0])} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            UPDATE HERO SECTION
          </button>
        </form>
      </div>

      {/* FORM 2: THE SKILLS LIST */}
      <div style={cardStyle}>
        <h3 style={{ color: "#16a34a", marginTop: "0" }}>2. Add Skill to Table</h3>
        <form onSubmit={handleSkillSubmit}>
          <label style={labelStyle}>Skill Name</label>
          <input placeholder="Skill Name" value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} style={inputStyle} />
          
          <label style={labelStyle}>Skill Category</label>
          <select value={newSkill.category} onChange={(e) => setNewSkill({...newSkill, category: e.target.value})} style={inputStyle}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label style={labelStyle}>Skill Level</label>
          <select value={newSkill.level} onChange={(e) => setNewSkill({...newSkill, level: e.target.value})} style={inputStyle}>
            <option>Advanced</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>

          <label style={labelStyle}>Skill Icon</label>
          <input type="file" onChange={(e) => setSkillIcon(e.target.files[0])} style={inputStyle} />
          
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            CREATE SKILL ITEM
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSkills;
