import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateChurch.css";

const CreateChurch = () => {
  const { t } = useTranslation("translation", { keyPrefix: "createChurch" });

  const [church, setChurch] = useState({
    churchName: "",
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
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Controls the initial fetch of languages — while true, the form is
  // hidden and a centered spinner is shown instead.
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);
        if (res.data?.length) {
          setChurch((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
        setError(t("errorLoadLanguages"));
      } finally {
        setPageLoading(false);
      }
    };
    fetchLanguages();
  }, []);

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
      setError(t("selectLanguageError"));
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("churchName", church.churchName);
      formData.append("description", church.description);
      formData.append("address", church.address);
      formData.append("serviceDays", church.serviceDays);
      formData.append("serviceTime", church.serviceTime);
      formData.append("language", church.language);
      formData.append("isFeatured", church.isFeatured);
      formData.append("isPrimary", church.isPrimary);

      if (church.image) {
        formData.append("image", church.image);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/churches", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("successMessage"));

      setChurch({
        churchName: "",
        description: "",
        address: "",
        serviceDays: "",
        serviceTime: "",
        language: languages[0]?._id || "",
        isFeatured: false,
        isPrimary: false,
        image: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="createChurch-page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid rgba(0, 0, 0, 0.1)",
              borderTopColor: "#1a2b4c",
              borderRadius: "50%",
              animation: "createChurchSpin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes createChurchSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="createChurch-page">
      <div className="createChurch-card">
        <h2 className="createChurch-title">{t("title")}</h2>

        {error && <p className="createChurch-error">{error}</p>}

        <form onSubmit={handleSubmit} className="createChurch-form">
          <label className="createChurch-label" htmlFor="cc-language">
            {t("languageLabel")}
            <span className="createChurch-required"> *</span>
          </label>
          <select
            id="cc-language"
            name="language"
            value={church.language}
            onChange={handleChange}
            required
            className="createChurch-select"
          >
            <option value="" disabled>
              {t("selectLanguage")}
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <label className="createChurch-label" htmlFor="cc-churchName">
            {t("churchNameLabel")}
            <span className="createChurch-required"> *</span>
          </label>
          <input
            id="cc-churchName"
            type="text"
            name="churchName"
            placeholder={t("churchNamePlaceholder")}
            value={church.churchName}
            onChange={handleChange}
            required
            className="createChurch-input"
          />

          <label className="createChurch-label" htmlFor="cc-description">
            {t("descriptionLabel")}
            <span className="createChurch-required"> *</span>
          </label>
          <textarea
            id="cc-description"
            name="description"
            placeholder={t("descriptionPlaceholder")}
            value={church.description}
            onChange={handleChange}
            rows="6"
            required
            className="createChurch-textarea"
          />

          <label className="createChurch-label" htmlFor="cc-address">
            {t("addressLabel")}
            <span className="createChurch-optional"> ({t("optional")})</span>
          </label>
          <input
            id="cc-address"
            type="text"
            name="address"
            placeholder={t("addressPlaceholder")}
            value={church.address}
            onChange={handleChange}
            className="createChurch-input"
          />

          <div className="createChurch-row">
            <div className="createChurch-col">
              <label className="createChurch-label" htmlFor="cc-serviceDays">
                {t("serviceDaysLabel")}
                <span className="createChurch-optional"> ({t("optional")})</span>
              </label>
              <input
                id="cc-serviceDays"
                type="text"
                name="serviceDays"
                placeholder={t("serviceDaysPlaceholder")}
                value={church.serviceDays}
                onChange={handleChange}
                className="createChurch-input"
              />
            </div>

            <div className="createChurch-col">
              <label className="createChurch-label" htmlFor="cc-serviceTime">
                {t("serviceTimeLabel")}
                <span className="createChurch-optional"> ({t("optional")})</span>
              </label>
              <input
                id="cc-serviceTime"
                type="text"
                name="serviceTime"
                placeholder={t("serviceTimePlaceholder")}
                value={church.serviceTime}
                onChange={handleChange}
                className="createChurch-input"
              />
            </div>
          </div>

          <label className="createChurch-fileLabel" htmlFor="cc-image">
            {t("uploadImageLabel")}
            <span className="createChurch-optional"> ({t("optional")})</span>
            <input
              id="cc-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="createChurch-fileInput"
            />
          </label>

          {preview && (
            <img src={preview} alt={t("imageAlt")} className="createChurch-preview" />
          )}

          <label className="createChurch-checkboxLabel">
            <input
              type="checkbox"
              name="isFeatured"
              checked={church.isFeatured}
              onChange={handleChange}
              className="createChurch-checkbox"
            />
            {t("featured")}
          </label>

          {/* UI-facing label maps internally to isPrimary, which drives the
              public hero section on the Church page. */}
          <label className="createChurch-checkboxLabel">
            <input
              type="checkbox"
              name="isPrimary"
              checked={church.isPrimary}
              onChange={handleChange}
              className="createChurch-checkbox"
            />
            <span>
              {t("setAsMainChurch")}
              <small className="createChurch-hint">{t("mainChurchHint")}</small>
            </span>
          </label>

          <button type="submit" disabled={loading} className="createChurch-submitButton">
            {loading ? t("submittingButton") : t("submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChurch;