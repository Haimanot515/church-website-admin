import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreateFaq.css";
import "../shared/AdminShared.css";

// Strips HTML tags for plain-text validation checks
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

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
          // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
          setFaq((prev) => ({ ...prev, language: prev.language || res.data[0].id }));
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

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(faq.question)) {
      setError(t("createFaq.errors.questionRequired"));
      return;
    }
    if (!stripHtml(faq.answer)) {
      setError(t("createFaq.errors.answerRequired"));
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
        // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
        language: languages[0]?.id || "",
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
      <div className="cfaq-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
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
                  <option key={lang.id} value={lang.id}>
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

              <RichTextField
                value={faq.question}
                onChange={(html) => setFaq((prev) => ({ ...prev, question: html }))}
                placeholder={t("createFaq.form.questionPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <RichTextField
                value={faq.answer}
                onChange={(html) => setFaq((prev) => ({ ...prev, answer: html }))}
                placeholder={t("createFaq.form.answerPlaceholder")}
                minHeight="180px"
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
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateFaq;