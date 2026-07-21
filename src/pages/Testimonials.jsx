import React, { useState, useEffect, useRef } from "react";
import API from "../api/api";
import "./Testimonials.css";

const Testimonials = () => {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: "", title: "", message: "" });
  const [file, setFile] = useState(null); 
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isVisible, setIsVisible] = useState(true); 
  
  const formRef = useRef(null);
  const mainContentRef = useRef(null); 

  const fetchTestimonials = async () => {
    try {
      const res = await API.get("/testimonials");
      const sortedData = Array.isArray(res.data) 
        ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setComments(sortedData);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    }
  };

  useEffect(() => {
    fetchTestimonials();

    const handleScroll = () => {
      if (mainContentRef.current) {
        const rect = mainContentRef.current.getBoundingClientRect();
        setIsVisible(rect.bottom > 0);
      }
    };

    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowForm(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("title", form.title);
    formData.append("message", form.message);
    if (file) formData.append("avatar", file);

    try {
      await API.post("/testimonials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSuccess("Feed updated.");
      setForm({ name: "", title: "", message: "" });
      setFile(null);
      fetchTestimonials(); 
      
      setTimeout(() => {
        setShowForm(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="testimonials-page">
      
      {/* FLOAT BUTTON */}
      <button 
        className="fab-button"
        onClick={() => setShowForm(true)} 
        style={{ 
          opacity: isVisible ? 1 : 0, 
          transform: isVisible ? 'scale(1)' : 'scale(0)',
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
      >
        +
      </button>

      <main ref={mainContentRef} className="testimonials-main">
        <header className="testimonials-header">
          <h1>Expert <span>Feed</span></h1>
          <p>
            Welcome to the Expert Feed, a live transparency layer where my technical skills, 
            academic knowledge, and professional attitude are put under the microscope. 
            This space is for verification—a collection of audits from AAiT chief executives 
            and industry peers.
          </p>
        </header>

        <div className="testimonials-feed">
          {comments.map((item) => (
            <div key={item._id} className="testimonial-card">
              <img 
                className="testimonial-avatar"
                src={item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=0070f3&color=fff`} 
                alt={item.name} 
              />
              <div className="testimonial-content">
                <h4>{item.name}</h4>
                <p className="testimonial-title">{item.title}</p>
                <p className="testimonial-msg">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* SIDEBAR FORM */}
      <aside 
        ref={formRef}
        className="sidebar-container"
        style={{ right: showForm ? 0 : '-450px' }}
      >
        <div className="sidebar-header">
          <h2>Verification Brief</h2>
          <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="testimonial-form">
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
          <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Job Title" required />
          <textarea className="form-input form-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Write assessment..." required />
          
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666' }}>Expert Avatar (Optional)</label>
          <input className="form-input" type="file" accept="image/*" onChange={handleFileChange} />

          <button className="form-submit-btn" type="submit">Submit to Feed</button>
          {success && <p style={{ color: 'green', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>{success}</p>}
        </form>
      </aside>
    </div>
  );
};

export default Testimonials;