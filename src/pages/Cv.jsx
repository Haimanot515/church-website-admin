import React, { useState, useEffect } from 'react';
import API from "../api/api.jsx"; 

const AdvancedCV = () => {
  const [landing, setLanding] = useState(() => {
    const savedData = localStorage.getItem("portfolio_landing_cache");
    return savedData ? JSON.parse(savedData) : null;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const fetchLandingData = async () => {
      try {
        const response = await API.get("/landingheros");
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          setLanding(data);
          localStorage.setItem("portfolio_landing_cache", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to fetch CV data:", error);
      }
    };

    fetchLandingData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getImageUrl = (path, fallback) => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path; 
    return `${API.defaults.baseURL}${path}`; 
  };

  const styles = {
    page: {
      background: '#f1f5f9',
      padding: isMobile ? '10px' : '50px 20px',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif"
    },
    cvContainer: {
      background: '#fff',
      width: '100%',
      maxWidth: '900px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '280px 1fr',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    sidebar: {
      background: '#0f172a', // Deep charcoal blue
      color: '#f8fafc',
      padding: '50px 30px',
    },
    main: {
      padding: isMobile ? '30px 20px' : '60px 50px',
      color: '#1e293b'
    },
    sectionTitle: {
      fontSize: '0.8rem',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      color: '#2563eb',
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: '8px',
      marginBottom: '20px',
      marginTop: '40px'
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media print {
          button { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .cv-container { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="cv-container" style={styles.cvContainer}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img 
              src={getImageUrl(landing?.heroImage, "https://res.cloudinary.com/dq3jkpys8/image/upload/v1770572615/portfolio/e9w0fstodhbevdxhnnnf.jpg")} 
              alt="Profile"
              style={{ width: '140px', height: '140px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #3b82f6', marginBottom: '20px' }}
            />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{landing?.ownerName || "Haimanot Beka"}</h2>
            <p style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '700', marginTop: '5px' }}>LEVEL: SENIOR DEVELOPER</p>
          </div>

          <h3 style={{ ...styles.sectionTitle, color: '#fff', borderColor: '#1e293b', marginTop: 0 }}>Expertise</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['System Architecture', 'Cloud Infrastructure', 'Full-Stack Mastery', 'API Design', 'Scalable Databases'].map(exp => (
              <div key={exp} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {exp}</div>
            ))}
          </div>

          <h3 style={{ ...styles.sectionTitle, color: '#fff', borderColor: '#1e293b' }}>Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['React/Next.js', 'Node/Express', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'TypeScript'].map(s => (
              <span key={s} style={{ fontSize: '0.65rem', background: '#1e293b', padding: '5px 10px', borderRadius: '3px', border: '1px solid #334155' }}>{s}</span>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          <header style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', color: '#0f172a' }}>
              {landing?.ownerName || "Haimanot Beka Mekonnen"}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: '700' }}>Senior Software Engineering Candidate</p>
          </header>

          <section>
            <h3 style={{ ...styles.sectionTitle, marginTop: 0 }}>Executive Summary</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#475569' }}>
              Strategic Software Engineering student at Addis Ababa University with a proven track record of architecting end-to-end digital solutions. 
              Specializing in high-concurrency systems and modern web stacks, I bridge the gap between complex engineering requirements and elegant user experiences.
            </p>
          </section>

          <section>
            <h3 style={styles.sectionTitle}>Academic Leadership</h3>
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem' }}>
                <span>Addis Ababa University</span>
                <span style={{ color: '#64748b' }}>2024 — Present</span>
              </div>
              <div style={{ color: '#2563eb', fontWeight: '700' }}>3rd Year Software Engineering Specialist</div>
              <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '10px', lineHeight: '1.6' }}>
                Maintaining top-tier academic standing while leading peer-mentorship groups in Data Structures and Algorithm Design. 
                Focusing on distributed systems and advanced software patterns.
              </p>
            </div>
          </section>

          <section>
            <h3 style={styles.sectionTitle}>Core Engineering Projects</h3>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                <span>Enterprise Portfolio CMS</span>
                <span style={{ color: '#64748b' }}>2025</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#475569', margin: '8px 0', lineHeight: '1.6' }}>
                • Architected a multi-tenant portfolio system with a unified API and dynamic caching strategy.<br/>
                • Implemented automated CI/CD pipelines and Cloudinary-integrated media management.<br/>
                • **Impact:** Reduced frontend latency by 45% through strategic state management.
              </p>
            </div>
          </section>

          <section>
            <h3 style={styles.sectionTitle}>Awards & Recognition</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {landing?.awards ? (
                landing.awards.split(',').map((award, i) => (
                  <div key={i} style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#2563eb', marginRight: '10px' }}>⬢</span> {award.trim()}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600' }}>⬢ Innovation Leader Award - AAU</div>
              )}
            </div>
          </section>

          <div style={{ marginTop: '60px', textAlign: 'center' }}>
            <button 
              onClick={() => window.print()} 
              style={{ 
                background: '#0f172a', 
                color: '#fff', 
                padding: '16px 40px', 
                border: 'none', 
                borderRadius: '4px', 
                fontWeight: '800', 
                cursor: 'pointer',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              DOWNLOAD CV AS PDF
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdvancedCV;
