import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateMedia.css";

const CreateMedia = () => {
  const { t } = useTranslation();

  const [media, setMedia] = useState({
    title: "",
    description: "",
    type: "photo",
    status: "published",
    category: "",
    language: "",
    file: null,
  });

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories and languages from the backend on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, langRes] = await Promise.all([API.get("/categories"), API.get("/languages")]);

        setCategories(catRes.data);
        setLanguages(langRes.data || []);

        if (langRes.data?.length) {
          setMedia((prev) => ({ ...prev, language: prev.language || langRes.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
        setError(t("createMedia.errors.loadCategories"));
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke the previous object URL whenever it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    setMedia({
      ...media,
      [e.target.name]: e.target.value,
    });
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

  return (
    <div className="cm-page">
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

          <select name="category" value={media.category} onChange={handleChange} disabled={optionsLoading}>
            <option value="">
              {optionsLoading ? t("createMedia.form.loadingCategories") : t("createMedia.form.selectCategory")}
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

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

          <button type="submit" disabled={loading || optionsLoading} className="cm-btn-primary">
            {loading ? t("createMedia.form.uploading") : t("createMedia.form.upload")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMedia;