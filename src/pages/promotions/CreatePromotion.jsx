import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreatePromotion.css";

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreatePromotion = () => {
  const { t } = useTranslation();

  const [promotion, setPromotion] = useState({
    title: "",
    description: "",
    language: "",
    photo: null,
  });

  const [languages, setLanguages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);

        if (res.data?.length) {
          // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
          setPromotion((prev) => ({ ...prev, language: prev.language || res.data[0].id }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotion((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPromotion((prev) => ({ ...prev, photo: file }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!promotion.language) {
      setError(t("createPromotion.errors.languageRequired"));
      return;
    }

    // RichTextField is a contenteditable, not an <input>/<textarea>, so it
    // can't rely on the native `required` attribute — check the plain-text
    // content of each converted field instead.
    if (!stripHtml(promotion.title)) {
      setError(t("createPromotion.errors.titleRequired"));
      return;
    }
    if (!stripHtml(promotion.description)) {
      setError(t("createPromotion.errors.descriptionRequired"));
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", promotion.title);
      formData.append("description", promotion.description);
      formData.append("language", promotion.language);

      if (promotion.photo) {
        formData.append("photo", promotion.photo);
      }

      await API.post("/promotions", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("createPromotion.successMessage"));

      setPromotion({
        title: "",
        description: "",
        // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
        language: languages[0]?.id || "",
        photo: null,
      });

      setPreview(null);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || t("createPromotion.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2>{t("createPromotion.heading")}</h2>

            {error && <p className="cp-error">{error}</p>}

            <form onSubmit={handleSubmit} className="cp-form">
              <select
                name="language"
                value={promotion.language}
                onChange={handleChange}
                required
                className="cp-select"
              >
                <option value="" disabled>
                  {t("createPromotion.form.selectLanguage")}
                </option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <RichTextField
                id="cp-title"
                value={promotion.title}
                onChange={(html) => setPromotion((prev) => ({ ...prev, title: html }))}
                placeholder={t("createPromotion.form.titlePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <RichTextField
                id="cp-description"
                value={promotion.description}
                onChange={(html) => setPromotion((prev) => ({ ...prev, description: html }))}
                placeholder={t("createPromotion.form.descriptionPlaceholder")}
                minHeight="140px"
              />

              <input type="file" accept="image/*" onChange={handleFileChange} className="cp-file-input" />

              {preview && (
                <img src={preview} alt={t("createPromotion.previewAlt")} className="cp-preview" />
              )}

              <button type="submit" disabled={loading} className="cp-btn-primary">
                {loading ? t("createPromotion.form.creating") : t("createPromotion.form.createButton")}
              </button>
            </form>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreatePromotion;