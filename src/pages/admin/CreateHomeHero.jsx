import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateHomeHero.css";

const CreateHomeHero = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    quote: "",
    name: "",
    role: "",
    story: "",
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [image, setImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);

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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "hero") {
      setImage(file);
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setStoryImage(file);
      if (file) setStoryPreview(URL.createObjectURL(file));
    }
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
      data.append("subtitle", formData.subtitle);
      data.append("description", formData.description);
      data.append("quote", formData.quote);
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("story", formData.story);
      data.append("language", formData.language);

      if (image) {
        data.append("image", image);
      }

      if (storyImage) {
        data.append("storyImage", storyImage);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/homeheros", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("createHomeHero.messages.createSuccess"));

      setFormData({
        title: "",
        subtitle: "",
        description: "",
        quote: "",
        name: "",
        role: "",
        story: "",
        language: languages[0]?._id || "",
      });

      setImage(null);
      setStoryImage(null);
      setPreview(null);
      setStoryPreview(null);
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

          <input
            type="text"
            name="subtitle"
            placeholder={t("createHomeHero.form.subtitlePlaceholder")}
            value={formData.subtitle}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder={t("createHomeHero.form.descriptionPlaceholder")}
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />

          <textarea
            name="quote"
            placeholder={t("createHomeHero.form.quotePlaceholder")}
            value={formData.quote}
            onChange={handleChange}
            rows="2"
          />

          <div className="hh-form-grid-2">
            <input
              type="text"
              name="name"
              placeholder={t("createHomeHero.form.namePlaceholder")}
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="role"
              placeholder={t("createHomeHero.form.rolePlaceholder")}
              value={formData.role}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="story"
            placeholder={t("createHomeHero.form.storyPlaceholder")}
            value={formData.story}
            onChange={handleChange}
            rows="6"
          />

          <div>
            <label className="hh-file-label">{t("createHomeHero.form.heroImageLabel")}</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "hero")} />
            {preview && <img src={preview} alt="preview" className="hh-file-preview" />}
          </div>

          <div>
            <label className="hh-file-label">{t("createHomeHero.form.storyImageLabel")}</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "story")} />
            {storyPreview && <img src={storyPreview} alt="story preview" className="hh-file-preview" />}
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