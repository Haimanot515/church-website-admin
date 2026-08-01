import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./LandingPage.css";

const AdminLoginPage = ({ setLoggedIn, setIsAdmin }) => {
  const { t } = useTranslation();

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
        setError(t("adminLogin.errors.notAdmin"));
        setSuccess("");
        return;
      }

      setLoggedIn(true);
      setIsAdmin(true);
      setSuccess(t("adminLogin.successMessage"));
      setError("");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || t("adminLogin.errors.generic");
      setSuccess("");
      setError(errorMsg);
    }
  };

  return (
    <div className="admin-login-page">
      {/* LEFT HALF — TEXT / BRANDING */}
      <div className="text-panel">
        {/* Vertical cross rail — left edge */}
        <div className="cross-rail-left">
          <span className="rail-line-top" />
          <Cross width={20} height={30} opacity={0.6} />
          <span className="rail-line-bottom" />
        </div>

        {/* Vertical cross rail — right edge */}
        <div className="cross-rail-right">
          <span className="rail-line-top" />
          <Cross width={20} height={30} opacity={0.6} />
          <span className="rail-line-bottom" />
        </div>

        {/* Decorative horizontal cross, centered in the panel */}
        <svg
          className="bg-cross"
          viewBox="0 0 320 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="0" y="78" width="320" height="44" rx="8" fill="currentColor" />
          <rect x="90" y="0" width="44" height="200" rx="8" fill="currentColor" />
        </svg>

        <div className="text-inner">
          <div className="brand-row">
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
            <span className="brand-name">{t("adminLogin.brandName")}</span>
          </div>

          <h1 className="heading">{t("adminLogin.heading")}</h1>
          <p className="subtext">{t("adminLogin.subtext")}</p>
          <ul className="list">
            <li className="list-item">
              <span className="bullet" />
              {t("adminLogin.list.manageContent")}
            </li>
            <li className="list-item">
              <span className="bullet" />
              {t("adminLogin.list.reviewActivity")}
            </li>
            <li className="list-item">
              <span className="bullet" />
              {t("adminLogin.list.configureSettings")}
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT HALF — LOGIN FORM */}
      <div className="form-panel">
        <div className="form-card">
          <div className="form-icon-wrap">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="10" y="0" width="4" height="24" rx="1.5" fill="#cf9f3f" />
              <rect x="0" y="7" width="24" height="4" rx="1.5" fill="#cf9f3f" />
            </svg>
          </div>
          <h2 className="form-title">{t("adminLogin.formTitle")}</h2>
          <p className="form-subtitle">{t("adminLogin.formSubtitle")}</p>

          <form onSubmit={handleSubmit} className="form">
            <label className="field-label">
              {t("adminLogin.emailLabel")}
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t("adminLogin.emailPlaceholder")}
                required
                className="input"
              />
            </label>

            <label className="field-label">
              {t("adminLogin.passwordLabel")}
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input"
              />
            </label>

            <button type="submit" className="submit-button">
              {t("adminLogin.submitButton")}
            </button>
          </form>

          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}

          <p className="footer-note">{t("adminLogin.footerNote")}</p>
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

export default AdminLoginPage;