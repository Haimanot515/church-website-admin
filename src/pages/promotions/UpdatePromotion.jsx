import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./UpdatePromotion.css";

const UpdatePromotion = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [promotion, setPromotion] = useState({
    title: "",
    description: "",
    language: "",
    photo: null,
  });

  const [languages, setLanguages] = useState([]);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch languages + the existing promotion in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [langRes, promoRes] = await Promise.all([
          API.get("/languages"),
          API.get(`/promotions/${id}`),
        ]);

        setLanguages(langRes.data || []);

        const data = promoRes.data.promotion || promoRes.data;

        setPromotion({
          title: data.title || "",
          description: data.description || "",
          language: data.language?._id || data.language || "",
          photo: null,
        });

        setExistingPhoto(data.photo || null);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || t("updatePromotion.errors.load"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      setError(t("updatePromotion.errors.languageRequired"));
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", promotion.title);
      formData.append("description", promotion.description);
      formData.append("language", promotion.language);

      // Only send a new photo if one was picked; otherwise backend keeps existing
      if (promotion.photo) {
        formData.append("photo", promotion.photo);
      }

      await API.put(`/promotions/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("updatePromotion.successMessage"));
      navigate("/admin/promotions/view");
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || t("updatePromotion.errors.update"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/promotions/view");
  };

  if (loading) return <p className="up-loading">{t("updatePromotion.loadingMessage")}</p>;

  return (
    <div className="up-page">
      <div className="up-card">
        <h2>{t("updatePromotion.heading")}</h2>

        {error && <p className="up-error">{error}</p>}

        <form onSubmit={handleSubmit} className="up-form">
          <select
            name="language"
            value={promotion.language}
            onChange={handleChange}
            required
            className="up-select"
          >
            <option value="" disabled>
              {t("updatePromotion.form.selectLanguage")}
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
            placeholder={t("updatePromotion.form.titlePlaceholder")}
            value={promotion.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("updatePromotion.form.descriptionPlaceholder")}
            rows="6"
            value={promotion.description}
            onChange={handleChange}
            required
          />

          {existingPhoto && !preview && (
            <div className="up-current-photo">
              <span>{t("updatePromotion.currentImageLabel")}</span>
              <img src={existingPhoto} alt={promotion.title} className="up-preview" />
            </div>
          )}

          <input type="file" accept="image/*" onChange={handleFileChange} className="up-file-input" />

          {preview && (
            <img src={preview} alt={t("updatePromotion.previewAlt")} className="up-preview" />
          )}

          <div className="up-button-row">
            <button type="submit" disabled={saving} className="up-btn-primary">
              {saving ? t("updatePromotion.form.saving") : t("updatePromotion.form.saveButton")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="up-btn-cancel"
            >
              {t("updatePromotion.form.cancelButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePromotion;