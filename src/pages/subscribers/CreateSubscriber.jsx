import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateSubscriber.css";

const CreateSubscriber = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Matches POST /api/subscribers -> subscribe
      const res = await API.post("/subscribers", { email });

      setSuccess(res.data?.msg || t("createSubscriber.successMessage"));
      setEmail("");
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.msg || t("createSubscriber.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-page">
      <div className="cs-card">
        <h2>{t("createSubscriber.heading")}</h2>

        {error && <p className="cs-error">{error}</p>}

        {success && <p className="cs-success">{success}</p>}

        <form onSubmit={handleSubmit} className="cs-form">
          <input
            type="email"
            name="email"
            placeholder={t("createSubscriber.form.emailPlaceholder")}
            value={email}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading} className="cs-btn-primary">
            {loading ? t("createSubscriber.form.adding") : t("createSubscriber.form.addButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSubscriber;