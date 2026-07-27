import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const AdminLoginPage = ({ setLoggedIn, setIsAdmin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);

      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      const adminFlag = payload.isAdmin === true || payload.isAdmin === "true";

      if (!adminFlag) {
        setError("This account does not have admin access.");
        setSuccess("");
        return;
      }

      setLoggedIn(true);
      setIsAdmin(true);
      setSuccess("Login successful! Redirecting...");
      setError("");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Something went wrong";
      setSuccess("");
      setError(errorMsg);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT HALF — TEXT / BRANDING */}
      <div style={styles.textPanel}>
        {/* Vertical cross rail — left edge */}
        <div style={styles.crossRailLeft}>
          <span style={styles.railLineTop} />
          <Cross width={20} height={30} opacity={0.6} />
          <span style={styles.railLineBottom} />
        </div>

        {/* Vertical cross rail — right edge */}
        <div style={styles.crossRailRight}>
          <span style={styles.railLineTop} />
          <Cross width={20} height={30} opacity={0.6} />
          <span style={styles.railLineBottom} />
        </div>

        {/* Decorative horizontal cross, centered in the panel */}
        <svg
          style={styles.bgCross}
          viewBox="0 0 320 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0" y="78" width="320" height="44" rx="8" fill="currentColor" />
          <rect x="90" y="0" width="44" height="200" rx="8" fill="currentColor" />
        </svg>

        <div style={styles.textInner}>
          <div style={styles.brandRow}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="10" y="0" width="4" height="24" rx="1.5" fill="#cf9f3f" />
              <rect x="0" y="7" width="24" height="4" rx="1.5" fill="#cf9f3f" />
            </svg>
            <span style={styles.brandName}>Abune Gebre Menfes Kidus Church</span>
          </div>

          <h1 style={styles.heading}>Admin Console</h1>
          <p style={styles.subtext}>
            This area is reserved for site administrators. Sign in with your
            admin credentials to manage content, users, and settings.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.bullet} />
              Manage published content
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet} />
              Review user activity
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet} />
              Configure site settings
            </li>
          </ul>

          
        </div>
      </div>

      {/* RIGHT HALF — LOGIN FORM */}
      <div style={styles.formPanel}>
        <div style={styles.formCard}>
          <div style={styles.formIconWrap}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="10"
                y="0"
                width="4"
                height="24"
                rx="1.5"
                fill="#cf9f3f"
              />
              <rect
                x="0"
                y="7"
                width="24"
                height="4"
                rx="1.5"
                fill="#cf9f3f"
              />
            </svg>
          </div>
          <h2 style={styles.formTitle}>Admin Login</h2>
          <p style={styles.formSubtitle}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.fieldLabel}>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@church.org"
                required
                style={styles.input}
              />
            </label>

            <label style={styles.fieldLabel}>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </label>

            <button type="submit" style={styles.button}>
              Log In
            </button>
          </form>

          {success && <p style={styles.success}>{success}</p>}
          {error && <p style={styles.error}>{error}</p>}

          

          <p style={styles.footerNote}>
            Having trouble signing in? Contact the church office for help
            regaining access.
          </p>
        </div>
      </div>
    </div>
  );
};

const Cross = ({ width = 18, height = 26, opacity = 1 }) => {
  const barW = Math.round(width * 0.22);
  const barH = Math.round(height * 0.16);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect x={(width - barW) / 2} y="0" width={barW} height={height} fill="#cf9f3f" opacity={opacity} />
      <rect x={(width - width * 0.85) / 2} y={height * 0.24} width={width * 0.85} height={barH} fill="#cf9f3f" opacity={opacity} />
    </svg>
  );
};

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    flexWrap: "wrap",
    borderTop: "6px solid #145a32",
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
  },
  textPanel: {
    position: "relative",
    overflow: "hidden",
    flex: "1 1 480px",
    background: "linear-gradient(160deg, #1c3a52 0%, #0f2438 65%, #0a1a29 100%)",
    color: "#eaf3f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 48px",
  },
  crossRailLeft: {
    position: "absolute",
    left: "14px",
    top: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
  crossRailRight: {
    position: "absolute",
    right: "14px",
    top: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
  railLineTop: {
    width: "2px",
    flex: 1,
    background:
      "linear-gradient(180deg, rgba(207,159,63,0) 0%, rgba(207,159,63,0.5) 100%)",
  },
  railLineBottom: {
    width: "2px",
    flex: 1,
    background:
      "linear-gradient(180deg, rgba(207,159,63,0.5) 0%, rgba(207,159,63,0) 100%)",
  },
  bgCross: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "320px",
    height: "200px",
    color: "rgba(207, 159, 63, 0.07)",
    pointerEvents: "none",
  },
  textInner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "420px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "28px",
  },
  brandName: {
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    color: "#eaf3f8",
  },
  eyebrow: {
    fontSize: "0.78rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#cf9f3f",
    display: "block",
    marginBottom: "16px",
  },
  heading: {
    fontSize: "2.6rem",
    fontWeight: 700,
    margin: "0 0 18px 0",
    lineHeight: 1.15,
  },
  subtext: {
    fontSize: "1.05rem",
    lineHeight: 1.6,
    color: "#a9c2d3",
    marginBottom: "28px",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.98rem",
    color: "#a9c2d3",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  bullet: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#cf9f3f",
    flexShrink: 0,
  },
  verse: {
    marginTop: "32px",
    paddingLeft: "16px",
    borderLeft: "2px solid rgba(207,159,63,0.5)",
    fontSize: "0.95rem",
    fontStyle: "italic",
    lineHeight: 1.6,
    color: "#cdd9e2",
  },
  verseRef: {
    display: "block",
    marginTop: "8px",
    fontStyle: "normal",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#cf9f3f",
  },
  linksRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "18px",
  },
  link: {
    fontSize: "0.85rem",
    color: "#1c3a52",
    fontWeight: 600,
    textDecoration: "none",
  },
  footerNote: {
    marginTop: "22px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(15,36,56,0.08)",
    fontSize: "0.78rem",
    lineHeight: 1.5,
    color: "#8b98a3",
  },
  formPanel: {
    flex: "1 1 420px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7f9",
    padding: "40px 24px",
  },
  formCard: {
    width: "100%",
    maxWidth: "380px",
    background: "#fff",
    padding: "44px 36px",
    borderRadius: "14px",
    boxShadow: "0 20px 45px rgba(15,36,56,0.12)",
    border: "1px solid rgba(15,36,56,0.06)",
  },
  formIconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#1c3a52",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto",
  },
  formTitle: {
    color: "#111",
    margin: "0 0 6px 0",
    fontSize: "1.6rem",
    fontWeight: 700,
    textAlign: "center",
  },
  formSubtitle: {
    color: "#7a8a95",
    fontSize: "0.9rem",
    margin: "0 0 26px 0",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#3d4c58",
  },
  input: {
    padding: "12px 14px",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    fontWeight: 400,
    color: "#111",
  },
  button: {
    background: "#1c3a52",
    color: "#fff",
    border: "none",
    padding: "13px 0",
    fontSize: "1rem",
    fontWeight: 700,
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "6px",
    transition: "background 0.2s ease",
  },
  success: {
    color: "#1a7f37",
    marginTop: "16px",
    fontSize: "0.9rem",
  },
  error: {
    color: "#d32f2f",
    marginTop: "16px",
    fontSize: "0.9rem",
  },
};

export default AdminLoginPage;