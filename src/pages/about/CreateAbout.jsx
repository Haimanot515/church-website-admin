import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateAbout.css";

const CreateAbout = () => {
  const { t } = useTranslation();

  const [about, setAbout] = useState({
    title: "",
    churchLeader: "",
    description: "",
    language: "",
    image: null,
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
          setAbout((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAbout((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAbout((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!about.language) {
      setError(t("createAbout.errors.languageRequired"));
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", about.title);
      formData.append("churchLeader", about.churchLeader);
      formData.append("description", about.description);
      formData.append("language", about.language);

      if (about.image) {
        formData.append("image", about.image);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/about", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("createAbout.successMessage"));

      setAbout({
        title: "",
        churchLeader: "",
        description: "",
        language: languages[0]?._id || "",
        image: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createAbout.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ca-page">
      <div className="ca-card">
        <h2>{t("createAbout.heading")}</h2>

        {error && <p className="ca-error">{error}</p>}

        <form onSubmit={handleSubmit} className="ca-form">
          <select
            name="language"
            value={about.language}
            onChange={handleChange}
            required
            className="ca-select"
          >
            <option value="" disabled>
              {t("createAbout.form.selectLanguage")}
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
            placeholder={t("createAbout.form.titlePlaceholder")}
            value={about.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="churchLeader"
            placeholder={t("createAbout.form.churchLeaderPlaceholder")}
            value={about.churchLeader}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder={t("createAbout.form.descriptionPlaceholder")}
            value={about.description}
            onChange={handleChange}
            rows="8"
            required
          />

          <input type="file" accept="image/*" onChange={handleFileChange} className="ca-file-input" />

          {preview && (
            <img src={preview} alt={t("createAbout.previewAlt")} className="ca-preview" />
          )}

          <button type="submit" disabled={loading} className="ca-btn-primary">
            {loading ? t("createAbout.form.creating") : t("createAbout.form.createButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAbout;