import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./About.css";

const About = () => {
  const [aboutList, setAboutList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await API.get("/about");
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setAboutList(data);
      } catch (error) {
        console.error("Failed to fetch about data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) return (
    <div className="about-loading">
      <div className="loading-spinner">LOADING...</div>
    </div>
  );

  return (
    <section className="about-section">
      <div className="about-container">
        {aboutList.map((item) => (
          <div key={item._id} className="about-item">
            
            {/* TALLER PHOTO SIDE */}
            <div className="about-photo-side"> 
              {item.image && (
                <div className="about-img-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="about-image"
                  />
                </div>
              )}
              {/* Artistic accent background */}
              <div className="about-art-accent"></div>
            </div>

            {/* TEXT SIDE */}
            <div className="about-text-side">
              <span className="about-label">
                Software as a career full stack developer addis ababa university
              </span>
              
              <h2 className="about-title">
                {item.title}
              </h2>

              <div className="about-description">
                <p>{item.description}</p>
              </div>

              <div className="about-tags">
                <div className="about-tag">AAIT Scholar</div>
                <div className="about-tag">Software Engineering</div>
                <div className="about-tag">MERN Stack</div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default About;