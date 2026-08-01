import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreatePromotion.css";

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
          setPromotion((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
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
        language: languages[0]?._id || "",
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
      <div className="cp-card">
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
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <input
            type="text"
            name="title"
            placeholder={t("createPromotion.form.titlePlaceholder")}
            value={promotion.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("createPromotion.form.descriptionPlaceholder")}
            rows="6"
            value={promotion.description}
            onChange={handleChange}
            required
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
  );
};

export default CreatePromotion;