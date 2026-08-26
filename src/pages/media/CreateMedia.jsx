import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateMedia.css";

const CreateMedia = () => {
  const { t } = useTranslation();

  const spinnerStyles = `
    .cm-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #555;
      padding: 8px 0;
    }
    .cm-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.15);
      border-top-color: currentColor;
      border-radius: 50%;
      display: inline-block;
      animation: cm-spin 0.7s linear infinite;
    }
    @keyframes cm-spin {
      to { transform: rotate(360deg); }
    }
  `;

  const [media, setMedia] = useState({
    title: "",
    description: "",
    type: "photo",
    status: "published",
    category: "",
    language: "",
    file: null,
  });

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch languages once on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        const data = Array.isArray(res.data) ? res.data : res.data.languages || [];
        setLanguages(data);

        if (data.length) {
          setMedia((prev) => ({ ...prev, language: prev.language || data[0]._id }));
        }
      } catch (err) {
        console.log(err);
        setError(t("createMedia.errors.loadLanguages"));
      } finally {
        setLanguagesLoading(false);
      }
    };

    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch categories whenever the selected language changes, scoped
  // to that language specifically.
  useEffect(() => {
    if (!media.language) {
      setCategories([]);
      return;
    }

    const selectedLang = languages.find((l) => l._id === media.language);
    if (!selectedLang) return;

    const fetchCategoriesForLanguage = async () => {
      try {
        setCategoriesLoading(true);
        const res = await API.get("/categories", {
          headers: { "Accept-Language": selectedLang.code },
        });
        setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
      } catch (err) {
        console.log(err);
        setError(t("createMedia.errors.loadCategories"));
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategoriesForLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.language, languages]);

  // Revoke the previous object URL whenever it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "language") {
      // Changing language invalidates whatever category was selected,
      // since categories are scoped per language
      setMedia((prev) => ({
        ...prev,
        language: value,
        category: "",
      }));
      return;
    }

    setMedia((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setMedia({
      ...media,
      file: file,
    });

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const getAcceptForType = () => {
    if (media.type === "photo") {
      return "image/*";
    }
    if (media.type === "video") {
      return "video/*";
    }
    if (media.type === "audio") {
      return "audio/*";
    }
    if (media.type === "document") {
      return "application/pdf";
    }
    return "*/*";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!media.language) {
      setError(t("createMedia.errors.selectLanguage"));
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", media.title);
      formData.append("description", media.description);
      formData.append("type", media.type);
      formData.append("status", media.status);
      formData.append("category", media.category);
      formData.append("language", media.language);

      if (media.file) {
        formData.append("file", media.file);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("createMedia.uploadSuccess"));

      setMedia({
        title: "",
        description: "",
        type: "photo",
        status: "published",
        category: "",
        language: languages[0]?._id || "",
        file: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createMedia.errors.upload"));
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form until the initial backend data (languages) has
  // finished loading — avoids flashing an unusable/empty form first.
  if (languagesLoading) {
    return (
      <div className="cm-page">
        <style>{spinnerStyles}</style>
        <div className="cm-card">
          <h2 className="cm-title">{t("createMedia.heading")}</h2>
          <div className="cm-loading">
            <span className="cm-spinner" aria-hidden="true" />
            <span>{t("createMedia.form.loadingLanguages")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">
      <style>{spinnerStyles}</style>
      <div className="cm-card">
        <h2 className="cm-title">{t("createMedia.heading")}</h2>

        {error && <p className="cm-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cm-form">
          <select name="language" value={media.language} onChange={handleChange} required>
            <option value="" disabled>
              {t("createMedia.form.selectLanguage")}
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <input
            type="text"
            name="title"
            placeholder={t("createMedia.form.titlePlaceholder")}
            value={media.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("createMedia.form.descriptionPlaceholder")}
            rows="5"
            value={media.description}
            onChange={handleChange}
          />

          <select name="type" value={media.type} onChange={handleChange}>
            <option value="photo">{t("createMedia.form.typePhoto")}</option>
            <option value="video">{t("createMedia.form.typeVideo")}</option>
            <option value="audio">{t("createMedia.form.typeAudio")}</option>
            <option value="document">{t("createMedia.form.typeDocument")}</option>
          </select>

          {/* Category is scoped to the selected language, so it stays
              hidden until a language is chosen and its categories have
              actually finished fetching from the backend. */}
          {!media.language ? null : categoriesLoading ? (
            <div className="cm-loading">
              <span className="cm-spinner" aria-hidden="true" />
              <span>{t("createMedia.form.loadingCategories")}</span>
            </div>
          ) : (
            <select name="category" value={media.category} onChange={handleChange}>
              <option value="">
                {categories.length === 0
                  ? t("createMedia.form.noCategoriesForLanguage")
                  : t("createMedia.form.selectCategory")}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          <select name="status" value={media.status} onChange={handleChange}>
            <option value="draft">{t("createMedia.form.saveDraft")}</option>
            <option value="published">{t("createMedia.form.publish")}</option>
          </select>

          <input type="file" accept={getAcceptForType()} onChange={handleFileChange} required />

          {preview && media.type === "photo" && (
            <img src={preview} alt="preview" className="cm-file-preview" />
          )}

          {preview && media.type === "video" && (
            <video src={preview} controls className="cm-video-preview" />
          )}

          {preview && media.type === "audio" && <audio src={preview} controls />}

          {preview && media.type === "document" && (
            <div className="cm-pdf-frame-wrap">
              <iframe src={preview} title="PDF preview" className="cm-pdf-frame" />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || categoriesLoading || !media.language}
            className="cm-btn-primary"
          >
            {loading ? t("createMedia.form.uploading") : t("createMedia.form.upload")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMedia;