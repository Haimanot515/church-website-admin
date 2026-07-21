import React, { useState, useEffect } from "react";
import API from "../api/api";
import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [mainHero, setMainHero] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearFirstTwo = currentYear.toString().slice(0, 2);
  const yearLastTwo = currentYear.toString().slice(2, 4);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/hero");
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setMainHero(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await API.post("/contact", form);
      setSuccess(res.data.msg || "Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      const serverMsg = err.response?.data?.msg || "Something went wrong!";
      setError(serverMsg);
    }
  };

  return (
    <div className="contact-page">
      
      <nav className="contact-nav">
        <div className="contact-nav-profile">
          {mainHero?.image && (
            <img src={mainHero.image} alt="Profile" className="nav-profile-img" />
          )}
          <div className="nav-profile-name">Haimanot Beka</div>
        </div>

        <div className="contact-nav-logo">
          <div className="logo-year">
            <span className="logo-year-first">{yearFirstTwo}</span>
            <span className="logo-year-last">{yearLastTwo}</span>
          </div>
          <div className="logo-label">GET IN TOUCH</div>
        </div>

        <div className="contact-nav-links">
          <a href="/services">Services</a>
          <a href="/social">Social</a>
          <a href="/advisory" style={{ color: '#0070f3' }}>Advisory</a>
        </div>
      </nav>

      <main className="contact-container">
        
        <section className="contact-hero">
          <div className="contact-hero-text">
            <h1 className="contact-hero-title">
              Get in <br />
              <span>Touch</span>
            </h1>
            
            <p className="contact-hero-desc">
              "Great digital products are forged through disciplined engineering. 
              I prioritize absolute quality over speed. If you value precision and 
              clean code, let’s start the conversation."
            </p>
          </div>

          <div className="contact-form-wrapper">
            <form onSubmit={handleSubmit} className="contact-form">
              <h2>Contact me</h2>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required className="contact-input" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="contact-input" />
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell me about your vision..." required className="contact-textarea" />
              <button type="submit" className="contact-btn">Send Inquiry</button>
              {success && <p style={{ color: "#4ade80", marginTop: "20px", fontWeight: "700" }}>{success}</p>}
              {error && <p style={{ color: "#fb7185", marginTop: "20px", fontWeight: "700" }}>{error}</p>}
            </form>
          </div>
        </section>

        <section className="impact-stats">
          <div className="stats-flex">
            <div className="stat-item"><h2>100%</h2><p>Client Respect</p></div>
            <div className="stat-item"><h2>Quality</h2><p>Over Speed</p></div>
            <div className="stat-item"><h2>MERN</h2><p>Specialization</p></div>
          </div>
        </section>

        <section className="creed-section">
          <div className="creed-image" style={{ backgroundImage: `url('https://res.cloudinary.com/dq3jkpys8/image/upload/v1770378640/home_hero/pwll8bimogcspsbydgeg.jpg')` }}></div>
          <div>
            <h2 style={{ fontSize: "3rem", marginBottom: "30px", color: "#000", fontWeight: "900", letterSpacing: "-2px" }}>The Coder's Creed.</h2>
            <div className="creed-grid">
              <div className="creed-item"><strong>Discipline</strong><p>No food 'til done.</p></div>
              <div className="creed-item"><strong>Core Stack</strong><p>MERN Specialist</p></div>
              <div className="creed-item"><strong>Priority</strong><p>Quality over Speed</p></div>
              <div className="creed-item"><strong>Values</strong><p>Absolute Respect</p></div>
            </div>
            <p style={{ marginTop: "40px", color: "#555", lineHeight: "1.8", fontSize: "1.1rem" }}>
              I don't just write code; I respect the craft. My philosophy is simple: complete the mission first, respect the customer always, and never compromise on the quality of the final product. 
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
