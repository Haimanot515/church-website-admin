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
        <div style={styles.textInner}>
          <span style={styles.eyebrow}>Restricted Access</span>
          <h1 style={styles.heading}>Admin Console</h1>
          <p style={styles.subtext}>
            This area is reserved for site administrators. Sign in with your
            admin credentials to manage content, users, and settings.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Manage published content</li>
            <li style={styles.listItem}>Review user activity</li>
            <li style={styles.listItem}>Configure site settings</li>
          </ul>
        </div>
      </div>

      {/* RIGHT HALF — LOGIN FORM, DIRECTLY ON THE PAGE */}
      <div style={styles.formPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Admin Login</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Admin email"
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Log In
            </button>
          </form>

          {success && <p style={styles.success}>{success}</p>}
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    flexWrap: "wrap",
    borderTop: "6px solid #145a32", // dark green horizontal border at top edge
  },
  textPanel: {
    flex: "1 1 480px",
    background: "linear-gradient(180deg, #1c3a52 0%, #0f2438 100%)",
    color: "#eaf3f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 48px",
  },
  textInner: {
    maxWidth: "420px",
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
    fontSize: "0.98rem",
    color: "#a9c2d3",
    padding: "8px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
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
    maxWidth: "360px",
    background: "#fff",
    padding: "40px 32px",
    borderRadius: "10px",
    boxShadow: "0 10px 30px rgba(15,36,56,0.1)",
  },
  formTitle: {
    color: "#111",
    marginBottom: "24px",
    fontSize: "1.6rem",
    fontWeight: 700,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "12px 14px",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
  },
  button: {
    background: "#1c3a52",
    color: "#fff",
    border: "none",
    padding: "13px 0",
    fontSize: "1rem",
    fontWeight: 700,
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "4px",
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