import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateHomeHero.css";

const CreateHomeHero = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);
        // Default to the first language if none selected yet
        if (res.data?.length) {
          setFormData((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.language) {
      setError(t("createHomeHero.messages.selectLanguage"));
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("language", formData.language);

      if (image) {
        data.append("image", image);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/homeheros", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("createHomeHero.messages.createSuccess"));

      setFormData({
        title: "",
        description: "",
        language: languages[0]?._id || "",
      });

      setImage(null);
      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || t("createHomeHero.messages.createError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hh-page">
      <div className="hh-card">
        <h2 className="hh-title">{t("createHomeHero.createTitle")}</h2>

        {error && <p className="hh-error">{error}</p>}

        <form onSubmit={handleSubmit} className="hh-form">
          <select name="language" value={formData.language} onChange={handleChange} required>
            <option value="" disabled>
              {t("createHomeHero.form.selectLanguagePlaceholder")}
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
            placeholder={t("createHomeHero.form.titlePlaceholder")}
            value={formData.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("createHomeHero.form.descriptionPlaceholder")}
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />

          <div>
            <label className="hh-file-label">{t("createHomeHero.form.heroImageLabel")}</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="preview" className="hh-file-preview" />}
          </div>

          <div className="hh-form-actions">
            <button type="submit" disabled={loading} className="hh-btn-primary">
              {loading ? t("createHomeHero.buttons.creating") : t("createHomeHero.buttons.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHomeHero;