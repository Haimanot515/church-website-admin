import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./UpdateChurch.css";

const UpdateChurch = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [church, setChurch] = useState({
    churchName: "",
    shortDescription: "",
    description: "",
    address: "",
    serviceDays: "",
    serviceTime: "",
    language: "",
    isFeatured: false,
    isPrimary: false,
    image: null,
  });

  const [languages, setLanguages] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch languages + the existing church in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [langRes, churchRes] = await Promise.all([
          API.get("/languages"),
          API.get(`/churches/${id}`),
        ]);

        setLanguages(langRes.data || []);

        const data = churchRes.data.church || churchRes.data;

        setChurch({
          churchName: data.churchName || "",
          shortDescription: data.shortDescription || "",
          description: data.description || "",
          address: data.address || "",
          serviceDays: data.serviceDays || "",
          serviceTime: data.serviceTime || "",
          language: data.language?._id || data.language || "",
          isFeatured: !!data.isFeatured,
          isPrimary: !!data.isPrimary,
          image: null,
        });

        setExistingImage(data.image || null);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || t("updateChurch.loadErrorMessage"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChurch({
      ...church,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setChurch({ ...church, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!church.language) {
      setError(t("updateChurch.selectLanguageError"));
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("churchName", church.churchName);
      formData.append("shortDescription", church.shortDescription);
      formData.append("description", church.description);
      formData.append("address", church.address);
      formData.append("serviceDays", church.serviceDays);
      formData.append("serviceTime", church.serviceTime);
      formData.append("language", church.language);
      formData.append("isFeatured", church.isFeatured);
      formData.append("isPrimary", church.isPrimary);

      // Only send a new image if one was picked; otherwise backend keeps existing
      if (church.image) {
        formData.append("image", church.image);
      }

      // Auth header is already attached globally by the API interceptor
      await API.put(`/churches/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("updateChurch.successMessage"));
      navigate("/admin/churches/view");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("updateChurch.errorMessage"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/churches/view");
  };

  if (loading) return <p className="updateChurch-loading">{t("updateChurch.loadingMessage")}</p>;

  return (
    <div className="updateChurch-page">
      <div className="updateChurch-card">
        <h2 className="updateChurch-title">{t("updateChurch.title")}</h2>

        {error && <p className="updateChurch-error">{error}</p>}

        <form onSubmit={handleSubmit} className="updateChurch-form">
          <select
            name="language"
            value={church.language}
            onChange={handleChange}
            required
            className="updateChurch-select"
          >
            <option value="" disabled>
              {t("updateChurch.selectLanguage")}
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <input
            type="text"
            name="churchName"
            placeholder={t("updateChurch.churchNamePlaceholder")}
            value={church.churchName}
            onChange={handleChange}
            required
            className="updateChurch-input"
          />

          <textarea
            name="shortDescription"
            placeholder={t("updateChurch.shortDescriptionPlaceholder")}
            value={church.shortDescription}
            onChange={handleChange}
            rows="2"
            required
            className="updateChurch-textarea"
          />

          <textarea
            name="description"
            placeholder={t("updateChurch.descriptionPlaceholder")}
            value={church.description}
            onChange={handleChange}
            rows="6"
            required
            className="updateChurch-textarea"
          />

          <input
            type="text"
            name="address"
            placeholder={t("updateChurch.addressPlaceholder")}
            value={church.address}
            onChange={handleChange}
            required
            className="updateChurch-input"
          />

          <div className="updateChurch-row">
            <input
              type="text"
              name="serviceDays"
              placeholder={t("updateChurch.serviceDaysPlaceholder")}
              value={church.serviceDays}
              onChange={handleChange}
              required
              className="updateChurch-input"
            />
            <input
              type="text"
              name="serviceTime"
              placeholder={t("updateChurch.serviceTimePlaceholder")}
              value={church.serviceTime}
              onChange={handleChange}
              required
              className="updateChurch-input"
            />
          </div>

          {existingImage && !preview && (
            <div className="updateChurch-currentImage">
              <span>{t("updateChurch.currentImageLabel")}</span>
              <img
                src={existingImage}
                alt={church.churchName}
                className="updateChurch-preview"
              />
            </div>
          )}

          <label className="updateChurch-fileLabel">
            {t("updateChurch.uploadImageLabel")}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="updateChurch-fileInput"
            />
          </label>

          {preview && (
            <img src={preview} alt={t("updateChurch.imageAlt")} className="updateChurch-preview" />
          )}

          <label className="updateChurch-checkboxLabel">
            <input
              type="checkbox"
              name="isFeatured"
              checked={church.isFeatured}
              onChange={handleChange}
              className="updateChurch-checkbox"
            />
            {t("updateChurch.featured")}
          </label>

          {/* UI-facing label maps internally to isPrimary, which drives the
              public hero section on the Church page. */}
          <label className="updateChurch-checkboxLabel">
            <input
              type="checkbox"
              name="isPrimary"
              checked={church.isPrimary}
              onChange={handleChange}
              className="updateChurch-checkbox"
            />
            <span>
              {t("updateChurch.setAsMainChurch")}
              <small className="updateChurch-hint">{t("updateChurch.mainChurchHint")}</small>
            </span>
          </label>

          <div className="updateChurch-buttonRow">
            <button type="submit" disabled={saving} className="updateChurch-submitButton">
              {saving ? t("updateChurch.savingButton") : t("updateChurch.saveButton")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="updateChurch-cancelButton"
            >
              {t("updateChurch.cancelButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateChurch;