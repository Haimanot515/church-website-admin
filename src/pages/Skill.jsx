import React, { useState, useEffect } from "react";
import API from "../api/api.jsx";
import "./Skill.css";

const Skill = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]); 
  const [activeCategory, setActiveCategory] = useState("All");
  const [hero, setHero] = useState(null); 
  const [mainHero, setMainHero] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearFirstTwo = currentYear.toString().slice(0, 2);
  const yearLastTwo = currentYear.toString().slice(2, 4);

  const categories = [
    "All", "Programming Languages", "Cybersecurity", "Frontend", 
    "Backend", "AI", "DevOps", "Mobile"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, heroRes, mainHeroRes] = await Promise.all([
          API.get("/skills"),
          API.get("/skill-hero"),
          API.get("/homeheros") 
        ]);
        
        setSkills(skillsRes.data);
        setFilteredSkills(skillsRes.data);
        
        const heroData = Array.isArray(heroRes.data) ? heroRes.data[0] : heroRes.data;
        setHero(heroData);

        const mHeroData = Array.isArray(mainHeroRes.data) ? mainHeroRes.data[0] : mainHeroRes.data;
        setMainHero(mHeroData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setFilteredSkills(skills);
    } else {
      setFilteredSkills(skills.filter(s => s.category === cat));
    }
  };

  return (
    <div className="skill-page">
      
      <nav className="skill-nav">
        <div className="profile-section">
          {mainHero?.image && (
            <img src={mainHero.image} alt="Profile" className="profile-img" />
          )}
          <div className="profile-name">H.Mekonnen</div>
        </div>

        <div className="logo-section">
          <div className="year-display">
            <span className="year-first">{yearFirstTwo}</span>
            <span className="year-last">{yearLastTwo}</span>
          </div>
          <div className="repo-label">
            {activeCategory === "All" ? "Repository" : activeCategory}
          </div>
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
              {cat === "Programming Languages" ? "Languages" : cat}
            </span>
          ))}
        </div>
      </nav>

      <main className="skill-container">
        
        <section className="hero-section">
          <div className="hero-text-content">
            <h1 className="hero-title">
              {hero?.title ? (
                <>
                  {hero.title.split(' ').slice(0, -1).join(' ')} <br/>
                  <span>
                    {hero.title.split(' ').slice(-1)}
                  </span>
                </>
              ) : (
                <>Technical <br/><span>Mastery</span></>
              )}
            </h1>

            <p className="hero-desc">
              {hero?.description || "Architecting technical foundations and specialized implementations within the portfolio."}
            </p>

            {hero?.quote && (
              <p className="hero-quote">
                "{hero.quote}"
              </p>
            )}
          </div>
          
          <div className="hero-image-side">
            {hero?.image ? (
              <img src={hero.image} alt="Technical Architecture" className="hero-main-img" />
            ) : (
              <div className="hero-placeholder"></div>
            )}
          </div>
        </section>

        <hr className="section-divider" />

        <section style={{ paddingBottom: '100px' }}>
          <div className="skills-grid">
            {filteredSkills.map((skill, index) => (
              <div key={skill._id || index} className="skill-card">
                <div className="skill-card-top">
                  <img 
                    src={skill.image || "https://via.placeholder.com/60"} 
                    alt={skill.name} 
                    className="skill-icon" 
                  />
                  <span className="skill-badge">
                    {skill.level}
                  </span>
                </div>

                <h3 className="skill-name-heading">
                  {skill.name}
                </h3>

                <p className="skill-story-text">
                  {skill.story || `Specialized implementation of ${skill.name}.`}
                </p>

                <div className="skill-footer-links">
                  {['Where', 'When', 'How'].map((label) => (
                    <a 
                      key={label}
                      href={skill[`${label.toLowerCase()}Link`] || "#"} 
                      className="skill-link-item"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Skill;