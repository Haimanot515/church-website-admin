import React, { useState, useEffect } from "react";
import API from "../../api/api";

const AdminLanding = () => {
  const [landingData, setLandingData] = useState({
    title: "",
    description: "",
    missionTitle: "",
    missionDescription: "",
    personalBio: "",
    awards: "",
    mainShowcaseId: "",
    selectedProjectId: "",
    architectureId: "",
    innovationId: "",
    tutorialDesc: "",
    lifestyleDesc: ""
  });

  const [awardsList, setAwardsList] = useState([""]);

  const [files, setFiles] = useState({
    heroImage: null,
    campusImage: null,
    aboutImage: null,
    mainShowcaseFile: null,
    selectedProjectFile: null,
    architectureFile: null,
    innovationFile: null,
    tutorialImage: null,
    lifestyleImage: null,
  });

  const [previews, setPreviews] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const extractYouTubeId = (input) => {
    if (!input) return "";
    if (input.length === 11 && !input.includes("/")) return input;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
  };

  useEffect(() => {
    // Load cached data first
    const localData = localStorage.getItem("portfolio_cache");
    if (localData) {
      const parsed = JSON.parse(localData);
      setLandingData(parsed.landingData);
      setAwardsList(parsed.awardsList);
    }

    const fetchLandingData = async () => {
      try {
        // Updated to plural /landingheros to match server.js
        const res = await API.get("/landingheros");
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          const fetchedLanding = {
            title: data.title || "",
            description: data.description || "",
            missionTitle: data.missionTitle || "",
            missionDescription: data.missionDescription || "",
            personalBio: data.personalBio || "",
            awards: data.awards || "",
            mainShowcaseId: data.mainShowcaseId || "",
            selectedProjectId: data.selectedProjectId || "",
            architectureId: data.architectureId || "",
            innovationId: data.innovationId || "",
            tutorialDesc: data.tutorialDesc || "",
            lifestyleDesc: data.lifestyleDesc || "",
          };
          
          setLandingData(fetchedLanding);
          
          setPreviews({
            heroImage: data.heroImage ? `${API.defaults.baseURL}${data.heroImage}` : null,
            campusImage: data.campusImage ? `${API.defaults.baseURL}${data.campusImage}` : null,
            aboutImage: data.aboutImage ? `${API.defaults.baseURL}${data.aboutImage}` : null,
            tutorialImage: data.tutorialImage ? `${API.defaults.baseURL}${data.tutorialImage}` : null,
            lifestyleImage: data.lifestyleImage ? `${API.defaults.baseURL}${data.lifestyleImage}` : null,
          });

          if (data.awards) {
            const fetchedAwards = data.awards.split(",").map(a => a.trim());
            setAwardsList(fetchedAwards);
            localStorage.setItem("portfolio_cache", JSON.stringify({
              landingData: fetchedLanding,
              awardsList: fetchedAwards
            }));
          }
        }
      } catch (err) {
        console.error("No landing data found.");
      }
    };
    fetchLandingData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLandingData({ ...landingData, [name]: value });
  };

  const handleAwardChange = (index, value) => {
    const newAwards = [...awardsList];
    newAwards[index] = value;
    setAwardsList(newAwards);
  };

  const addAwardField = () => setAwardsList([...awardsList, ""]);
  const removeAwardField = (index) => {
    const newAwards = awardsList.filter((_, i) => i !== index);
    setAwardsList(newAwards);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFiles({ ...files, [e.target.name]: file });
    if (file) {
      setPreviews({ ...previews, [e.target.name]: URL.createObjectURL(file) });
    }
  };

  const saveSection = async (endpoint, formData) => {
    const token = localStorage.getItem("token");
    // Updated to plural /landingheros to match server.js
    return API.put(`/landingheros${endpoint}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const awardsString = awardsList.filter(a => a.trim() !== "").join(", ");

      const appendIfNotEmpty = (form, key, value) => {
        if (value === null || value === undefined) return;
        if (typeof value === "string" && value.trim() === "") return;
        form.append(key, value);
      };

      // HERO & CAMPUS
      const heroForm = new FormData();
      appendIfNotEmpty(heroForm, "title", landingData.title);
      appendIfNotEmpty(heroForm, "description", landingData.description);
      appendIfNotEmpty(heroForm, "missionTitle", landingData.missionTitle);
      appendIfNotEmpty(heroForm, "missionDescription", landingData.missionDescription);
      appendIfNotEmpty(heroForm, "heroImage", files.heroImage);
      appendIfNotEmpty(heroForm, "campusImage", files.campusImage);
      await saveSection("/hero", heroForm);

      // ACADEMIC
      const academicForm = new FormData();
      appendIfNotEmpty(academicForm, "personalBio", landingData.personalBio);
      appendIfNotEmpty(academicForm, "awards", awardsString);
      appendIfNotEmpty(academicForm, "image", files.aboutImage);
      await saveSection("/academic", academicForm);

      // VIDEO GRIDS
      const videoForm = new FormData();
      appendIfNotEmpty(videoForm, "mainShowcaseId", extractYouTubeId(landingData.mainShowcaseId));
      appendIfNotEmpty(videoForm, "selectedProjectId", extractYouTubeId(landingData.selectedProjectId));
      appendIfNotEmpty(videoForm, "architectureId", extractYouTubeId(landingData.architectureId));
      appendIfNotEmpty(videoForm, "innovationId", extractYouTubeId(landingData.innovationId));
      appendIfNotEmpty(videoForm, "mainShowcaseFile", files.mainShowcaseFile);
      appendIfNotEmpty(videoForm, "selectedProjectFile", files.selectedProjectFile);
      appendIfNotEmpty(videoForm, "architectureFile", files.architectureFile);
      appendIfNotEmpty(videoForm, "innovationFile", files.innovationFile);
      await saveSection("/videos", videoForm);

      // LIFESTYLE / TUTORIAL
      const lifeForm = new FormData();
      appendIfNotEmpty(lifeForm, "tutorialDesc", landingData.tutorialDesc);
      appendIfNotEmpty(lifeForm, "lifestyleDesc", landingData.lifestyleDesc);
      appendIfNotEmpty(lifeForm, "tutorialImage", files.tutorialImage);
      appendIfNotEmpty(lifeForm, "lifestyleImage", files.lifestyleImage);
      await saveSection("/lifestyle", lifeForm);

      // Cache latest data for instant input visibility
      localStorage.setItem("portfolio_cache", JSON.stringify({
        landingData,
        awardsList
      }));

      setMessage("✅ Portfolio synced successfully!");
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.error || "Sync failed."));
    } finally {
      setLoading(false);
    }
  };

  // Styles remain exactly as before
  const cardStyle = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", marginBottom: "20px" };
  const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ddd" };
  const labelStyle = { fontWeight: "bold", fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block", marginTop: "10px" };
  const videoBoxStyle = { background: "#f1f5f9", padding: "15px", borderRadius: "8px", marginTop: "15px", border: "1px dashed #cbd5e1" };
  const addBtnStyle = { background: "#2563eb", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginTop: "10px" };
  const removeBtnStyle = { background: "#ef4444", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", marginLeft: "10px" };
  const imgPreviewStyle = { width: "120px", height: "70px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ccc", marginTop: "10px" };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: "#0f172a", marginBottom: "30px" }}>Portfolio Admin</h1>

        {message && (
          <div style={{ padding: "15px", textAlign: "center", borderRadius: "8px", background: message.includes("✅") ? "#dcfce7" : "#fee2e2", color: message.includes("✅") ? "#166534" : "#991b1b", marginBottom: "20px", fontWeight: "bold" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmitAll}>
          {/* Hero & Campus */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2563eb", marginTop: 0 }}>1. Hero & My Campus</h3>
            <label style={labelStyle}>Main Title</label>
            <input name="title" value={landingData.title} onChange={handleChange} style={inputStyle} />
            <label style={labelStyle}>Hero Description</label>
            <textarea name="description" value={landingData.description} onChange={handleChange} style={{...inputStyle, height: "60px"}} />
            <label style={labelStyle}>Main Hero Photo</label>
            {previews.heroImage && <img src={previews.heroImage} style={imgPreviewStyle} alt="Preview" />}
            <input type="file" name="heroImage" onChange={handleFileChange} style={inputStyle} />
            <hr style={{ margin: "20px 0", border: "0.5px solid #eee" }} />
            <label style={labelStyle}>Campus Name / Title</label>
            <input name="missionTitle" value={landingData.missionTitle} onChange={handleChange} style={inputStyle} />
            <label style={labelStyle}>Campus Description</label>
            <textarea name="missionDescription" value={landingData.missionDescription} onChange={handleChange} style={{...inputStyle, height: "60px"}} />
            <label style={labelStyle}>Campus Background Image</label>
            {previews.campusImage && <img src={previews.campusImage} style={imgPreviewStyle} alt="Preview" />}
            <input type="file" name="campusImage" onChange={handleFileChange} style={inputStyle} />
            <div style={videoBoxStyle}>
              <label style={{ ...labelStyle, color: "#1e40af" }}>Main Campus Showcase (Video)</label>
              <input name="mainShowcaseId" placeholder="YouTube Link or ID" value={landingData.mainShowcaseId} onChange={handleChange} style={inputStyle} />
              <input type="file" name="mainShowcaseFile" onChange={handleFileChange} style={inputStyle} />
            </div>
          </div>

          {/* Academic Bio & Awards */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2563eb", marginTop: 0 }}>2. Academic Bio & Awards</h3>
            <label style={labelStyle}>Personal Bio</label>
            <textarea name="personalBio" value={landingData.personalBio} onChange={handleChange} style={{...inputStyle, height: "80px"}} />
            <label style={labelStyle}>Academic Awards (Bullets)</label>
            {awardsList.map((award, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center" }}>
                <input value={award} onChange={(e) => handleAwardChange(index, e.target.value)} placeholder={`Award #${index + 1}`} style={inputStyle} />
                {awardsList.length > 1 && (
                  <button type="button" onClick={() => removeAwardField(index)} style={removeBtnStyle}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAwardField} style={addBtnStyle}>+ Add More Awards</button>
            <label style={{...labelStyle, marginTop: "20px"}}>Bio/Degree Image</label>
            {previews.aboutImage && <img src={previews.aboutImage} style={imgPreviewStyle} alt="Preview" />}
            <input type="file" name="aboutImage" onChange={handleFileChange} style={inputStyle} />
          </div>

          {/* Project Video Grids */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2563eb", marginTop: 0 }}>3. Project Video Grids</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
              <div>
                <label style={labelStyle}>Selected Project Video</label>
                <input name="selectedProjectId" placeholder="YouTube ID" value={landingData.selectedProjectId} onChange={handleChange} style={inputStyle} />
                <input type="file" name="selectedProjectFile" onChange={handleFileChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Architecture Grid</label>
                <input name="architectureId" placeholder="YouTube ID" value={landingData.architectureId} onChange={handleChange} style={inputStyle} />
                <input type="file" name="architectureFile" onChange={handleFileChange} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Innovation Grid</label>
                <input name="innovationId" placeholder="YouTube ID" value={landingData.innovationId} onChange={handleChange} style={inputStyle} />
                <input type="file" name="innovationFile" onChange={handleFileChange} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Lifestyle & Tutorials */}
          <div style={cardStyle}>
            <h3 style={{ color: "#2563eb", marginTop: 0 }}>4. Lifestyle & Mentorship</h3>
            <label style={labelStyle}>Tutorials Description</label>
            <input name="tutorialDesc" value={landingData.tutorialDesc} onChange={handleChange} style={inputStyle} />
            {previews.tutorialImage && <img src={previews.tutorialImage} style={imgPreviewStyle} alt="Preview" />}
            <input type="file" name="tutorialImage" onChange={handleFileChange} style={inputStyle} />
            <label style={labelStyle}>Lifestyle Description</label>
            <input name="lifestyleDesc" value={landingData.lifestyleDesc} onChange={handleChange} style={inputStyle} />
            {previews.lifestyleImage && <img src={previews.lifestyleImage} style={imgPreviewStyle} alt="Preview" />}
            <input type="file" name="lifestyleImage" onChange={handleFileChange} style={inputStyle} />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: "100%", padding: "20px", background: "#0f172a", color: "white", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "16px" }}
          >
            {loading ? "SYNCING PORTFOLIO..." : "SAVE ALL CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLanding;