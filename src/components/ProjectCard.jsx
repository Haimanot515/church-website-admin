import React from "react";

const ProjectCard = ({ project }) => {
  return (
    <div style={cardStyle}>
      {/* IMAGE SECTION */}
      {project.image && (
        <div style={imageContainerStyle}>
          <img src={project.image} alt={project.title} style={imageStyle} />
          <div style={overlayStyle}></div>
        </div>
      )}

      {/* CONTENT SECTION */}
      <div style={contentStyle}>
        <div style={headerRow}>
          <div>
            <h3 style={titleStyle}>{project.title}</h3>
            {/* Divider set to light gray - avoid blue */}
            <div style={dividerStyle}></div>
          </div>
        </div>
        
        <p style={descriptionStyle}>{project.description}</p>
        
        {/* TECH STACK */}
        <div style={techContainerStyle}>
          {project.techStack?.map((skill, index) => (
            <span key={index} style={chipStyle}>{skill}</span>
          ))}
        </div>

        {/* ACTION BAR */}
        <div style={buttonContainerStyle}>
          <a href={project.githubLink} target="_blank" rel="noreferrer" style={linkButtonStyle}>
            GitHub
          </a>
          <a href={project.liveLink} target="_blank" rel="noreferrer" style={linkButtonStyle}>
            Live
          </a>
          <a href={project.docsLink} target="_blank" rel="noreferrer" style={linkButtonStyle}>
            Docs
          </a>
          <a href={project.demoLink} target="_blank" rel="noreferrer" style={demoButtonStyle}>
            Video Demo
          </a>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---

export const sectionWrapperStyle = {
  background: "#ffffff", 
  width: "100%",
  padding: "50px 0"
};

const cardStyle = {
  background: "#ffffff", 
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)", 
  border: "1px solid #f1f5f9", 
  display: "flex",
  flexDirection: "column",
  height: "100%",
  position: "relative"
};

const imageContainerStyle = { width: "100%", height: "180px", overflow: "hidden", position: "relative" };
const imageStyle = { width: "100%", height: "100%", objectFit: "cover" };
const overlayStyle = { position: "absolute", inset: 0, background: "rgba(0,0,0,0.01)" };

const contentStyle = { 
  padding: "25px 30px", 
  display: "flex", 
  flexDirection: "column", 
  flexGrow: 1 
};

const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" };
const titleStyle = { fontSize: "1.4rem", color: "#0f172a", fontWeight: "900", margin: 0, letterSpacing: "-0.5px" };

const dividerStyle = { width: "30px", height: "3px", background: "#f1f5f9", marginTop: "6px" };

const descriptionStyle = { 
  fontSize: "0.95rem", 
  color: "#475569", 
  lineHeight: "1.6", 
  marginBottom: "15px", 
  flexGrow: 1 
};

const techContainerStyle = { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" };
const chipStyle = { 
  fontSize: "0.65rem", 
  background: "#f8fafc", 
  color: "#1e293b", 
  padding: "4px 8px", 
  borderRadius: "4px", 
  fontWeight: "700",
  textTransform: "uppercase",
  border: "1px solid #f1f5f9"
};

const buttonContainerStyle = { 
  display: "flex", 
  gap: "8px", 
  marginTop: "auto",
  flexWrap: "nowrap" // Ensures buttons stay in one row
};

const linkButtonStyle = { 
  flex: 1, 
  textAlign: "center", 
  padding: "10px 2px", 
  borderRadius: "8px", 
  background: "#ffffff",
  border: "1px solid #f1f5f9", 
  textDecoration: "none", 
  color: "#1e293b", 
  fontWeight: "800", 
  fontSize: "0.7rem",
  whiteSpace: "nowrap", // Prevents text wrapping inside the button
  overflow: "hidden",   // Ensures text stays contained
  textOverflow: "ellipsis" 
};

const demoButtonStyle = { 
  flex: 1.2, 
  textAlign: "center", 
  padding: "10px 2px", 
  borderRadius: "8px", 
  background: "#ffffff", 
  border: "1px solid #f1f5f9", 
  color: "#1e293b", 
  textDecoration: "none", 
  fontWeight: "800", 
  fontSize: "0.7rem",
  whiteSpace: "nowrap", // Prevents text wrapping inside the button
  overflow: "hidden",
  textOverflow: "ellipsis"
};

export default ProjectCard;