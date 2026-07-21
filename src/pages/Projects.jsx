import React, { useEffect, useState } from "react";
import API from "../api/api.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [hero, setHero] = useState(null);
  const [mainHero, setMainHero] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearFirstTwo = currentYear.toString().slice(0, 2);
  const yearLastTwo = currentYear.toString().slice(2, 4);

  const categories = [
    "All", "Full-Stack", "Frontend", "Backend", "Mobile App", 
    "SaaS", "AI/ML", "UI/UX", "Blockchain", "Cybersecurity", 
    "Cloud Native", "DevOps", "Data Science", "E-commerce", 
    "API Design", "Open Source", "Automation"
  ];

  useEffect(() => {
    API.get("/projects")
      .then((res) => {
        setProjects(res.data);
        setFilteredProjects(res.data);
      })
      .catch((err) => console.error("Error fetching projects:", err));

    API.get("/project-hero")
      .then((res) => {
        setHero(res.data);
      })
      .catch((err) => console.error("Error fetching project hero:", err));

    API.get("/hero")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setMainHero(data);
      })
      .catch((err) => console.error("Error fetching main hero:", err));
  }, []);

  const handleFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category === cat));
    }
  };

  return (
    <div className="projects-page">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="projects-nav">
        <div className="nav-profile">
          {mainHero?.image && (
            <img src={mainHero.image} alt="Profile" className="nav-profile-img" />
          )}
          <div className="nav-profile-name">H.Mekonnen</div>
        </div>

        <div className="nav-logo-stack">
          <div className="logo-year">
            <span style={{ color: '#eee' }}>{yearFirstTwo}</span>
            <span style={{ color: '#0070f3' }}>{yearLastTwo}</span>
          </div>
          <div className="logo-label">Repository</div>
        </div>
        
        <div className="category-scroll">
          {categories.map((cat) => (
            <span
              key={cat}
              onClick={() => handleFilter(cat)}
              className="category-item"
              style={{ 
                color: activeCategory === cat ? '#0070f3' : '#111',
                fontWeight: activeCategory === cat ? '700' : '500'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </nav>

      <main className="main-container">
        
        {/* 2. HERO SECTION */}
        <section className="projects-hero">
          <div className="hero-text-side">
            <h1 className="hero-title">
              {hero?.title ? (
                <>
                  {hero.title.split(' ').slice(0, -1).join(' ')} <br/>
                  <span style={{ color: '#0070f3' }}>
                    {hero.title.split(' ').slice(-1)}
                  </span>
                </>
              ) : (
                <>My Project <br/><span style={{ color: '#0070f3' }}>Repository</span></>
              )}
            </h1>
            
            <p className="hero-desc">
              {hero?.description || "This index represents a complete breakdown of my technical capabilities. From the core MERN stack to edge technologies, each category holds a curated selection of my work."}
            </p>
          </div>
          
          <div className="hero-image-side">
            {hero?.image ? (
              <img src={hero.image} alt="Architecture" className="hero-main-img" />
            ) : (
              <div className="hero-img-placeholder"></div>
            )}
          </div>
        </section>

        <hr className="divider" />

        {/* 3. DYNAMIC GRID */}
        <section className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))
          ) : (
            <div className="empty-state">
              <p className="empty-text">
                No active records found for {activeCategory}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Projects;