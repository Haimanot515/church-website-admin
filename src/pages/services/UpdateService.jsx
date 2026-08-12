import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./UpdateService.css";

const UpdateService = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState({
    title: "",
    description: "",
    day: "",
    time: "",
    category: "Other",
    language: "",
    location: "",
    isFeatured: false,
    image: null,
  });

  const [languages, setLanguages] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    "Worship",
    "Teaching",
    "Prayer",
    "Music",
    "Youth",
    "Ministry",
    "Outreach",
    "Other",
  ];

  // Fetch languages + the existing service in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [langRes, serviceRes] = await Promise.all([
          API.get("/languages"),
          API.get(`/services/${id}`),
        ]);

        setLanguages(langRes.data || []);

        const data = serviceRes.data.service || serviceRes.data;

        setService({
          title: data.title || "",
          description: data.description || "",
          day: data.day || "",
          time: data.time || "",
          category: data.category || "Other",
          language: data.language?._id || data.language || "",
          location: data.location || "",
          isFeatured: !!data.isFeatured,
          image: null,
        });

        setExistingImage(data.image || null);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || t("updateService.errors.load"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setService({
      ...service,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setService({ ...service, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!service.language) {
      setError(t("updateService.errors.selectLanguage"));
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", service.title);
      formData.append("description", service.description);
      formData.append("day", service.day);
      formData.append("time", service.time);
      formData.append("category", service.category);
      formData.append("language", service.language);
      formData.append("location", service.location);
      formData.append("isFeatured", service.isFeatured);

      // Only send a new image if the user picked one; otherwise backend keeps existing
      if (service.image) {
        formData.append("image", service.image);
      }

      await API.put(`/services/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("updateService.createSuccess"));
      navigate("/admin/services/view");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("updateService.errors.update"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/services/view");
  };

  if (loading) return <p className="ms-page">{t("updateService.loading")}</p>;

  return (
    <div className="ms-page">
      <div className="ms-edit-panel">
        <h3>{t("updateService.heading")}</h3>

        {error && <p className="ms-error">{error}</p>}

        <form onSubmit={handleSubmit} className="ms-form">
          <select name="language" value={service.language} onChange={handleChange} required>
            <option value="" disabled>
              {t("updateService.form.selectLanguage")}
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
            placeholder={t("updateService.form.titlePlaceholder")}
            value={service.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("updateService.form.descriptionPlaceholder")}
            rows="5"
            value={service.description}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="day"
            placeholder={t("updateService.form.dayPlaceholder")}
            value={service.day}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="time"
            placeholder={t("updateService.form.timePlaceholder")}
            value={service.time}
            onChange={handleChange}
            required
          />

          <select name="category" value={service.category} onChange={handleChange}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(`updateService.categories.${cat}`)}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="location"
            placeholder={t("updateService.form.locationPlaceholder")}
            value={service.location}
            onChange={handleChange}
          />

          <label className="ms-checkbox-label">
            <input
              type="checkbox"
              name="isFeatured"
              checked={service.isFeatured}
              onChange={handleChange}
            />
            {t("updateService.form.markFeatured")}
          </label>

          {existingImage && !preview && (
            <div className="ms-current-image">
              <span>{t("updateService.form.currentImage")}</span>
              <img src={existingImage} alt="current" className="ms-file-preview" />
            </div>
          )}

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && <img src={preview} alt="preview" className="ms-file-preview" />}

          <div className="ms-form-actions">
            <button type="submit" disabled={saving} className="ms-btn-primary">
              {saving ? t("updateService.form.updating") : t("updateService.form.update")}
            </button>

            <button
              type="button"
              disabled={saving}
              className="ms-btn-cancel"
              onClick={handleCancel}
            >
              {t("updateService.form.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateService;