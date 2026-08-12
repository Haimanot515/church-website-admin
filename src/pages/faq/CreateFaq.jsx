import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateFaq.css";

const CreateFaq = () => {
  const { t } = useTranslation();

  const [faq, setFaq] = useState({
    question: "",
    answer: "",
    category: "",
    order: 0,
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available languages
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

  // Fetch valid categories from the backend (schema enum), not a local hardcoded list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/faq/categories");
        setCategories(res.data || []);
        if (res.data?.length) {
          setFaq((prev) => ({ ...prev, category: prev.category || res.data[0] }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchCategories();
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
    if (!faq.category) {
      setError(t("createFaq.errors.categoryRequired"));
      return;
    }

    try {
      setLoading(true);
      await API.post("/faq", faq);
      alert(t("createFaq.successMessage"));

      setFaq({
        question: "",
        answer: "",
        category: categories[0] || "",
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
            <option value="" disabled>
              {t("createFaq.form.selectCategory")}
            </option>
            {categories.map((cat) => (
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