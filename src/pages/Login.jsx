import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const Login = ({ setLoggedIn, setIsAdmin, closeModal, switchToRegister }) => {
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

      setLoggedIn(true);
      setIsAdmin(adminFlag);
      setSuccess("Login successful!");
      setError("");

      setTimeout(() => {
        if (closeModal) closeModal();
        // Go straight to the final path — no index-route hop in between
        navigate(adminFlag ? "/admin/dashboard" : "/home");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Something went wrong";
      setSuccess("");

      if (errorMsg.toLowerCase().includes("user not found") || errorMsg.toLowerCase().includes("not registered")) {
        setError("Account not found. Redirecting to Register...");
        setTimeout(() => {
          if (switchToRegister) switchToRegister();
        }, 1500);
      } else {
        setError(errorMsg);
      }
    }
  };

  return (
    <>
      <h1 style={{ color: "#111", marginBottom: "20px" }}>Login</h1>
      <form className="login-form" onSubmit={handleSubmit} style={{ margin: 0, padding: 0 }}>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        Don't have an account?{" "}
        <button
          type="button"
          onClick={switchToRegister}
          style={{
            background: "none",
            border: "none",
            color: "#0077ff",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
            fontSize: "14px"
          }}
        >
          Register here
        </button>
      </div>
    </>
  );
};

export default Login;