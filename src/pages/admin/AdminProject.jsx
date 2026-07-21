import React, { useState, useEffect } from "react";
import API from "../../api/api";

const AdminProject = () => {
  // --- PART 1: PROJECT HERO STATE ---
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    description: "",
    name: "",
    role: "",
    quote: "",
  });
  const [heroImage, setHeroImage] = useState(null);
  const [previewHero, setPreviewHero] = useState(null);

  // --- PART 2: NEW PROJECT STATE ---
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "All", // ADDED CATEGORY
    techStack: "",
    githubLink: "",
    liveLink: "",
    demoLink: "",
    docsLink: "",
    image: null,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Define categories array to keep it consistent with your Projects page
  const categories = [
    "All", "Full-Stack", "Frontend", "Backend", "Mobile App", 
    "SaaS", "AI/ML", "UI/UX", "Blockchain", "Cybersecurity", 
    "Cloud Native", "DevOps", "Data Science", "E-commerce", 
    "API Design", "Open Source", "Automation"
  ];

  useEffect(() => {
    const fetchProjectHero = async () => {
      try {
        const res = await API.get("/project-hero");
        if (res.data) {
          setHeroData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            description: res.data.description || "",
            name: res.data.name || "",
            role: res.data.role || "",
            quote: res.data.quote || "",
          });
          if (res.data.image) setPreviewHero(`${API.defaults.baseURL}${res.data.image}`);
        }
      } catch (err) {
        console.log("No existing project hero found.");
      }
    };
    fetchProjectHero();
  }, []);

  const handleHeroChange = (e) => {
    setHeroData({ ...heroData, [e.target.name]: e.target.value });
  };

  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];
    setHeroImage(file);
    setPreviewHero(file ? URL.createObjectURL(file) : null);
  };

  const handleProjectFileChange = (e) => {
    const file = e.target.files[0];
    setNewProject({ ...newProject, image: file });
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const promises = [];

      // 1. Logic for ProjectHero
      const hData = new FormData();
      Object.keys(heroData).forEach((key) => hData.append(key, heroData[key]));
      if (heroImage) hData.append("image", heroImage);

      promises.push(
        API.post("/project-hero", hData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      // 2. Logic for New Project Entry
      if (newProject.title.trim()) {
        const pData = new FormData();
        pData.append("title", newProject.title);
        pData.append("description", newProject.description);
        pData.append("category", newProject.category); // ADDED CATEGORY TO FORMDATA
        pData.append("techStack", newProject.techStack);
        pData.append("githubLink", newProject.githubLink);
        pData.append("liveLink", newProject.liveLink);
        pData.append("demoLink", newProject.demoLink);
        pData.append("docsLink", newProject.docsLink);
        if (newProject.image) pData.append("image", newProject.image);

        promises.push(
          API.post("/projects", pData, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
      }

      await Promise.all(promises);
      setMessage("✅ Success! Portfolio Hero and Project updated.");

      setNewProject({
        title: "", description: "", category: "All", techStack: "", 
        githubLink: "", liveLink: "", demoLink: "", docsLink: "", image: null,
      });
      setPreview(null);
      setHeroImage(null);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.msg || "Failed to save data."));
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { background: "#fff", padding: "30px", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "30px" };
  const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", width: "100%", marginBottom: "12px" };
  const labelStyle = { fontWeight: "bold", fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "40px 20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontWeight: "900", color: "#1e293b", marginBottom: "30px" }}>Portfolio Manager</h1>

        {message && (
          <div style={{ padding: "15px", borderRadius: "10px", background: "#dcfce7", color: "#166534", marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: PROJECT HERO */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2563eb", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>1. Page Header (ProjectHero)</h3>
            <label style={labelStyle}>Header Title</label>
            <input name="title" value={heroData.title} onChange={handleHeroChange} style={inputStyle} placeholder="e.g. Featured Projects" />
            <label style={labelStyle}>Subtitle</label>
            <input name="subtitle" value={heroData.subtitle} onChange={handleHeroChange} style={inputStyle} placeholder="e.g. My Creative Work" />
            <label style={labelStyle}>Header Description</label>
            <textarea name="description" value={heroData.description} onChange={handleHeroChange} style={{ ...inputStyle, height: "80px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" value={heroData.name} onChange={handleHeroChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Job Role</label>
                <input name="role" value={heroData.role} onChange={handleHeroChange} style={inputStyle} />
              </div>
            </div>
            <label style={labelStyle}>Page Hero Image</label>
            <input type="file" onChange={handleHeroFileChange} style={inputStyle} />
            {previewHero && <img src={previewHero} alt="Hero Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }} />}
          </div>

          {/* SECTION 2: CREATE NEW PROJECT */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2563eb", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>2. Add New Project Entry</h3>
            
            <label style={labelStyle}>Project Title</label>
            <input type="text" placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} style={inputStyle} />
            
            <label style={labelStyle}>Project Category</label>
            <select 
              value={newProject.category} 
              onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} 
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label style={labelStyle}>Description</label>
            <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={4} style={inputStyle} />
            
            <label style={labelStyle}>Tech Stack</label>
            <input type="text" placeholder="Tech Stack (React, Node, etc.)" value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} style={inputStyle} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input type="text" placeholder="GitHub Link" value={newProject.githubLink} onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })} style={inputStyle} />
              <input type="text" placeholder="Live Link" value={newProject.liveLink} onChange={(e) => setNewProject({ ...newProject, liveLink: e.target.value })} style={inputStyle} />
              <input type="text" placeholder="Demo Link" value={newProject.demoLink} onChange={(e) => setNewProject({ ...newProject, demoLink: e.target.value })} style={inputStyle} />
              <input type="text" placeholder="Docs Link" value={newProject.docsLink} onChange={(e) => setNewProject({ ...newProject, docsLink: e.target.value })} style={inputStyle} />
            </div>

            <label style={labelStyle}>Project Screenshot</label>
            <input type="file" accept="image/*" onChange={handleProjectFileChange} style={inputStyle} />
            {preview && <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }} />}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%", padding: "18px", borderRadius: "12px", background: "#2563eb", color: "#fff",
              border: "none", cursor: "pointer", fontWeight: "900", fontSize: "16px", transition: "0.3s",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)"
            }}
          >
            {loading ? "SAVING EVERYTHING..." : "SAVE ALL CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProject;
