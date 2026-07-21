import React, { useState, useEffect } from "react";
import API from "../api/api.jsx"; 
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaTelegram } from "react-icons/fa";

const Home = () => {
  const [hero, setHero] = useState(null); 
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [storyData, setStoryData] = useState(null);

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width <= 768;
  const isFeaturePhone = width <= 480;

  const currentYear = new Date().getFullYear();
  const yearFirstTwo = currentYear.toString().slice(0, 2); 
  const yearLastTwo = currentYear.toString().slice(2, 4);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, skillsRes, projectsRes, aboutRes] = await Promise.all([
          API.get("/homeheros"), 
          API.get("/skills"),
          API.get("/projects"),
          API.get("/about")
        ]);

        const heroData = Array.isArray(heroRes.data) ? heroRes.data[0] : heroRes.data;
        setHero(heroData);

        const aboutData = Array.isArray(aboutRes.data) ? aboutRes.data : [aboutRes.data];
        const latestStory = aboutData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setStoryData(latestStory);

        setSkills(skillsRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const paragraphStyle = {
    fontSize: isMobile ? '1rem' : '1.1rem',
    color: '#555',
    lineHeight: '1.7',
    textAlign: isMobile ? 'left' : 'justify',
    hyphens: 'auto'
  };

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      color: '#111', 
      fontFamily: 'Inter, system-ui, sans-serif', 
      scrollBehavior: 'smooth',
      overflowX: 'clip', // Use clip to allow sticky behavior
      display: 'block',
      position: 'relative'
    }}>
      
      {/* 1. NAVIGATION BAR */}
      <nav style={{ 
        height: isMobile ? "auto" : "80px", 
        padding: isMobile ? '15px 20px' : '0 50px', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'sticky', 
        top: '0px', // Explicit string for top
        alignSelf: 'start',
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)', 
        zIndex: 9999, // Maximize z-index to stay on top
        borderBottom: '1px solid #eee',
        gap: isMobile ? '15px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hero?.image && (
            <img 
              src={hero.image} 
              alt="H.Mekonnen Profile" 
              style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} 
            />
          )}
          <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Haimanot Beka</div>
        </div>

        <h1 style={{ 
          margin: 0, 
          fontSize: isMobile ? '1.8rem' : '3rem', 
          fontWeight: '900', 
          letterSpacing: isMobile ? (isFeaturePhone ? '10px' : '30px') : '80px',
          display: 'flex'
        }}>
          <span style={{ color: '#111' }}>{yearFirstTwo}</span>
          <span style={{ color: '#0070f3' }}>{yearLastTwo}</span>
        </h1>
        
        <div style={{ display: 'flex', gap: isMobile ? '15px' : '30px', fontWeight: '500', fontSize: isMobile ? '0.9rem' : '1rem' }}>
          <a href="#about" style={{ textDecoration: 'none', color: '#111' }}>Story</a>
          <a href="#skills" style={{ textDecoration: 'none', color: '#111' }}>Skills</a>
          <a href="#work" style={{ textDecoration: 'none', color: '#111' }}>Work</a>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '0 15px' : '0 20px' }}>
        
        {/* 2. HERO SECTION */}
        <section id="home" style={{ 
          display: 'flex', 
          alignItems: isMobile ? 'center' : 'flex-start', 
          gap: isMobile ? '40px' : '60px', 
          flexDirection: isMobile ? 'column-reverse' : 'row',
          padding: isMobile ? '50px 0' : '80px 0', 
          minHeight: isMobile ? 'auto' : '80vh' 
        }}>
          
          <div style={{ flex: 1.5, minWidth: isMobile ? '100%' : '350px', display: 'flex', flexDirection: 'column', textAlign: isMobile ? 'center' : 'left' }}>
            <div>
              <h1 style={{ 
                fontSize: isFeaturePhone ? '2.5rem' : isMobile ? '3.5rem' : '5rem', 
                lineHeight: '1', 
                marginBottom: '25px', 
                letterSpacing: '-2px',
                marginTop: '0' 
              }}>
                {hero?.title ? (
                  <>
                    {hero.title.split(' ')[0]} <br/>
                    <span style={{ color: '#0070f3' }}>{hero.title.split(' ')[1]}</span> <br/>
                    {hero.title.split(' ').slice(2).join(' ')}
                  </>
                ) : (
                  <>Building <br/><span style={{ color: '#0070f3' }}>Digital</span> <br/>Excellence.</>
                )}
              </h1>
            
              <div style={{ maxWidth: isMobile ? '100%' : '500px', margin: isMobile ? '0 auto' : '0' }}>
                <p style={{ ...paragraphStyle, marginBottom: '20px', fontSize: isMobile ? '1.1rem' : '1.2rem', color: '#111' }}>
                  {hero?.description || "Loading specialized infrastructure..."}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', paddingTop: '20px', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
              <Link to="/projects" style={{ padding: '14px 24px', background: '#111', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Explore Projects</Link>
              <Link to="/cv" style={{ padding: '14px 24px', background: 'transparent', border: '1px solid #111', borderRadius: '8px', fontWeight: 'bold' }}>Get CV</Link>
            </div>
          </div>
          
          <div style={{ flex: 1, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '400px' : 'none', textAlign: 'center' }}>
             {hero?.image && (
               <>
                 <img 
                    src={hero.image} 
                    alt="Hero Image" 
                    style={{ width: '100%', borderRadius: '24px', boxShadow: isMobile ? '10px 10px 0px #f8f8f8' : '20px 20px 0px #f8f8f8', objectFit: 'cover' }} 
                  />
                  <div style={{ marginTop: '20px', fontFamily: 'sans-serif' }}>
                    <h3 style={{ margin: '0', fontSize: '1.5rem', fontWeight: '800' }}>Haimanot Beka Mekonnen</h3>
                    <p style={{ margin: '5px 0 0', color: '#0070f3', fontSize: '18px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Stack Developer</p>
                  </div>
               </>
             )}
          </div>
        </section>

        {/* 3. ABOUT SECTION */}
        <section id="about" style={{ padding: isMobile ? '60px 0' : '80px 0', borderTop: '1px solid #eee' }}>
          <h2 style={{ textAlign: isMobile ? "center" : "left", fontSize: isMobile ? '2.5rem' : '3rem', marginBottom: '60px' }}>The Story</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.8fr', gap: isMobile ? '30px' : '60px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100%', height: isMobile ? '350px' : '580px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', backgroundColor: '#f0f0f0' }}>
                {storyData?.image && <img src={storyData.image} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            </div>
            
            <div style={{ paddingTop: isMobile ? '10px' : '20px', textAlign: isMobile ? 'center' : 'left' }}>
              <p style={{ ...paragraphStyle, fontSize: isMobile ? '1.2rem' : '1.5rem', color: '#111', marginBottom: '20px', fontWeight: '500' }}>
                {storyData?.title || `I am ${hero?.name || "Haimanot Beka Mekonnen"}`}
              </p>
              <p style={paragraphStyle}>
                {storyData?.description || "I specialize in bridging the gap between high-level user requirements and delivery of high-performance codebases."}
              </p>
            </div>
          </div>
        </section>

        {/* 4. WORK SECTION */}
        <section id="work" style={{ padding: isMobile ? '60px 0' : '80px 0', borderTop: '1px solid #eee' }}>
          <h2 style={{ fontSize: isMobile ? '2.2rem' : '3rem', marginBottom: isMobile ? '40px' : '60px', textAlign: 'center' }}>Featured Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '60px' : '80px' }}>
            {projects.map((project, index) => {
                const git = project.github || project.githubLink || project.repo;
                const live = project.live || project.liveLink || project.link || project.url;
                const video = project.video || project.youtube || project.demo;

                return (
                <div key={project._id || index} style={{ 
                  display: 'flex', 
                  gap: isMobile ? '25px' : '60px', 
                  alignItems: 'center', 
                  flexDirection: isMobile ? 'column' : (index % 2 !== 0 ? 'row-reverse' : 'row')
                }}>
                  <div style={{ width: '100%', flex: 1, height: isMobile ? '250px' : '450px', background: '#f0f0f0', borderRadius: '24px', overflow: 'hidden' }}>
                    {project.image && <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                    <h3 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '15px' }}>{project.title}</h3>
                    <p style={paragraphStyle}>{project.description}</p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '25px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                      {git && <a href={git} target="_blank" rel="noreferrer" style={{ fontWeight: '800', color: '#111', textDecoration: 'none', borderBottom: '2px solid #111', fontSize: '0.8rem' }}>GITHUB</a>}
                      {live && <a href={live} target="_blank" rel="noreferrer" style={{ fontWeight: '800', color: '#0070f3', textDecoration: 'none', borderBottom: '2px solid #0070f3', fontSize: '0.8rem' }}>LIVE SITE</a>}
                      {video && <a href={video} target="_blank" rel="noreferrer" style={{ fontWeight: '800', color: '#ff0000', textDecoration: 'none', borderBottom: '2px solid #ff0000', fontSize: '0.8rem' }}>DEMO</a>}
                    </div>
                  </div>
                </div>
              )})}
          </div>
        </section>

        {/* 5. SKILLS SECTION */}
        <section id="skills" style={{ padding: isMobile ? '60px 0' : '80px 0', borderTop: '1px solid #eee' }}>
          <h2 style={{ fontSize: isMobile ? '2.2rem' : '3rem', marginBottom: '40px', textAlign: 'center' }}>Technical Mastery</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isFeaturePhone ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '15px'
          }}>
            {skills.map((skill, index) => (
              <div key={skill._id || index} style={{ 
                padding: '20px', 
                background: '#fdfdfd', 
                border: '1px solid #f1f5f9',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <h4 style={{ color: '#111', fontSize: '1.2rem', margin: 0 }}>{skill.name}</h4>
                <p style={{ color: '#0070f3', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', marginTop: '5px' }}>{skill.level}</p>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ 
          padding: '40px 0', 
          borderTop: '1px solid #eee', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: '30px',
          textAlign: 'center'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>© {currentYear} {hero?.name || "Haimanot Beka"}</h4>
            <p style={{ margin: '5px 0 0', color: '#888' }}>Engineering vision into reality.</p>
          </div>
          <div style={{ display: 'flex', gap: '25px', fontSize: '1.4rem' }}>
            <a href="https://github.com/Haimanot515" target="_blank" rel="noreferrer" style={{ color: '#111' }}><FaGithub /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#0070f3' }}><FaLinkedin /></a>
            <a href="mailto:haimanotbeka@gmail.com" style={{ color: '#111' }}><FaEnvelope /></a>
            <a href="https://t.me/haimasearchjobplanstart" target="_blank" rel="noreferrer" style={{ color: '#0070f3' }}><FaTelegram /></a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
