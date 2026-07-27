import React, { useState, useEffect } from "react";
import API from "../api/api.jsx";
import "./Footer.css";

const footerColumns = [
  { title: "Visit", items: ["Service Times", "Directions", "What to Expect"] },
  { title: "Get Involved", items: ["Ministries", "Volunteer", "Give", "Missions"] },
  { title: "Connect", items: ["Facebook", "Instagram", "YouTube"] }
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback("");
      setStatus("idle");
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setFeedback("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      // Matches: app.use("/api/subscribers", subscriberRoutes) -> POST "/"
      const res = await API.post("/subscribers", { email });
      setStatus("success");
      setFeedback(res.data?.msg || "Thanks for subscribing!");
      setEmail("");
    } catch (err) {
      console.error("Subscribe request failed:", err);
      setStatus("error");
      setFeedback(err.response?.data?.msg || "Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="site-footer">
      <section style={{ background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-deep) 100%)', color: '#eaf3f8' }}>
        <div className="wrapper" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <h3 className="display" style={{ fontSize: '2.9rem', fontWeight: 700, margin: '18px 0 18px 0' }}>
            A short reflection, delivered every Monday.
          </h3>
          <p style={{ fontSize: '1.3rem', color: '#a9c2d3', marginBottom: '32px' }}>
            One email a week — a verse, a short reflection, and this week's prayer requests.
          </p>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              disabled={status === "loading"}
              style={{ padding: '15px 20px', fontSize: '1.1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', width: '280px', maxWidth: '80vw', background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ background: 'var(--gold)', color: 'var(--navy-deep)', border: 'none', padding: '15px 32px', fontWeight: 700, borderRadius: '30px', cursor: status === "loading" ? 'default' : 'pointer', fontSize: '1.05rem', opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {feedback && (
            <p
              role="status"
              style={{
                marginTop: '16px',
                fontSize: '0.95rem',
                color: status === "error" ? '#ffb4b4' : '#a9e3c3',
              }}
            >
              {feedback}
            </p>
          )}
        </div>
      </section>

      <div className="wrapper">
        <div className="footer-grid">
          <div>
            <h4 className="display footer-brand">Harbor Light Church</h4>
            <p className="footer-tagline">Sunday services at 9:00 & 11:00 AM. All are welcome, always.</p>
          </div>
          {footerColumns.map((col, i) => (
            <div key={i}>
              <h5 className="eyebrow footer-col-title">{col.title}</h5>
              {col.items.map((s, j) => (
                <p key={j} className="footer-link">{s}</p>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p className="eyebrow footer-bottom-text">© 2026 Harbor Light Church</p>
          <p className="eyebrow footer-bottom-text">Privacy Policy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;