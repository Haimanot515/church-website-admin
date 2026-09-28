import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreateCategory.css";
import "../shared/AdminShared.css";

// Strips HTML tags for plain-text validation checks
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreateCategory = () => {
  const { t } = useTranslation();

  const [category, setCategory] = useState({
    name: "",
    // language-independent key shared across the same category's
    // translations (e.g. "travel" links Travel / Viaggi / ጉዞ together)
    slug: "",
    description: "",
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate the language dropdown from the same collection the backend
  // validates against
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        const langData = Array.isArray(res.data) ? res.data : res.data.languages;
        setLanguages(langData || []);
      } catch (err) {
        console.log(err);
        setError(t("createCategory.errors.loadLanguages"));
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  // slugs are lowercase, hyphenated, no spaces/punctuation — so
  // "Travel" and "travel " both normalize to "travel"
  const normalizeSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleSlugChange = (e) => {
    setCategory((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(category.name)) {
      setError(t("createCategory.errors.nameRequired"));
      return;
    }

    try {
      setLoading(true);

      // Auth header is already attached globally by the API interceptor
      await API.post("/categories", {
        name: category.name,
        slug: category.slug,
        description: category.description,
        language: category.language,
      });

      alert(t("createCategory.successMessage"));
      setCategory({ name: "", slug: "", description: "", language: "" });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createCategory.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    { name: t("createCategory.examples.sermons.name"), description: t("createCategory.examples.sermons.description") },
    { name: t("createCategory.examples.events.name"), description: t("createCategory.examples.events.description") },
    { name: t("createCategory.examples.testimonies.name"), description: t("createCategory.examples.testimonies.description") },
  ];

  return (
    <div className="cc-page">
      <div className="cc-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2>{t("createCategory.heading")}</h2>

            {error && <p className="cc-error">{error}</p>}

            <form onSubmit={handleSubmit} className="cc-form">
              <RichTextField
                value={category.name}
                onChange={(html) => setCategory((prev) => ({ ...prev, name: html }))}
                placeholder={t("createCategory.form.namePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <input
                type="text"
                name="slug"
                placeholder={t("createCategory.form.slugPlaceholder", "Slug (e.g. travel) — same slug across all languages for this category")}
                value={category.slug}
                onChange={handleSlugChange}
                required
              />

              <RichTextField
                value={category.description}
                onChange={(html) => setCategory((prev) => ({ ...prev, description: html }))}
                placeholder={t("createCategory.form.descriptionPlaceholder")}
                minHeight="140px"
              />

              <select
                name="language"
                value={category.language}
                onChange={handleChange}
                required
                disabled={languagesLoading}
                className="cc-select"
              >
                <option value="" disabled>
                  {languagesLoading
                    ? t("createCategory.form.loadingLanguages")
                    : t("createCategory.form.selectLanguage")}
                </option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <button type="submit" disabled={loading || languagesLoading} className="cc-btn-primary">
                {loading ? t("createCategory.form.creating") : t("createCategory.form.createButton")}
              </button>
            </form>

            <div className="cc-examples">
              <h4>{t("createCategory.examples.heading")}</h4>

              <div className="cc-table-wrap">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>{t("createCategory.examples.table.category")}</th>
                      <th>{t("createCategory.examples.table.description")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.map((ex) => (
                      <tr key={ex.name}>
                        <td data-label={t("createCategory.examples.table.category")}>{ex.name}</td>
                        <td data-label={t("createCategory.examples.table.description")}>{ex.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateCategory;