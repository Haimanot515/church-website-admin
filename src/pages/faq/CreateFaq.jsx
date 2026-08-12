import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateFaq.css";

const CATEGORIES = ["Visiting", "Kids", "Parking", "Groups"];

const CreateFaq = () => {
  const { t } = useTranslation();

  const [faq, setFaq] = useState({
    question: "",
    answer: "",
    category: CATEGORIES[0],
    order: 0,
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);
        if (res.data?.length) {
          setFaq((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFaq((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!faq.language) {
      setError(t("createFaq.errors.languageRequired"));
      return;
    }

    try {
      setLoading(true);

      // Auth header is already attached globally by the API interceptor
      await API.post("/faq", faq);

      alert(t("createFaq.successMessage"));

      setFaq({
        question: "",
        answer: "",
        category: CATEGORIES[0],
        order: 0,
        language: languages[0]?._id || "",
      });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createFaq.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cfaq-page">
      <div className="cfaq-card">
        <h2>{t("createFaq.heading")}</h2>

        {error && <p className="cfaq-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cfaq-form">
          <select
            name="language"
            value={faq.language}
            onChange={handleChange}
            required
            className="cfaq-select"
          >
            <option value="" disabled>
              {t("createFaq.form.selectLanguage")}
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <select
            name="category"
            value={faq.category}
            onChange={handleChange}
            required
            className="cfaq-select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="question"
            placeholder={t("createFaq.form.questionPlaceholder")}
            value={faq.question}
            onChange={handleChange}
            required
          />

          <textarea
            name="answer"
            placeholder={t("createFaq.form.answerPlaceholder")}
            value={faq.answer}
            onChange={handleChange}
            rows="6"
            required
          />

          <input
            type="number"
            name="order"
            placeholder={t("createFaq.form.orderPlaceholder")}
            value={faq.order}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading} className="cfaq-btn-primary">
            {loading ? t("createFaq.form.creating") : t("createFaq.form.createButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFaq;