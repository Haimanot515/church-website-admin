import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateService.css";

const CreateService = () => {
  const { t } = useTranslation();

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
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Category values stay in English — they're stored as-is on the backend.
  // Only the displayed label is translated via t("createService.categories.X").
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

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);

        if (res.data?.length) {
          setService((prev) => ({
            ...prev,
            language: prev.language || res.data[0]._id,
          }));
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchLanguages();
  }, []);

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
      setError(t("createService.errors.selectLanguage"));
      return;
    }

    try {
      setLoading(true);

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

      if (service.image) {
        formData.append("image", service.image);
      }

      await API.post("/services", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("createService.createSuccess"));

      setService({
        title: "",
        description: "",
        day: "",
        time: "",
        category: "Other",
        language: languages[0]?._id || "",
        location: "",
        isFeatured: false,
        image: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createService.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-page">
      <div className="cs-card">
        <h2 className="cs-title">{t("createService.heading")}</h2>

        {error && <p className="cs-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cs-form">
          <select name="language" value={service.language} onChange={handleChange} required>
            <option value="" disabled>
              {t("createService.form.selectLanguage")}
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
            placeholder={t("createService.form.titlePlaceholder")}
            value={service.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("createService.form.descriptionPlaceholder")}
            rows="5"
            value={service.description}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="day"
            placeholder={t("createService.form.dayPlaceholder")}
            value={service.day}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="time"
            placeholder={t("createService.form.timePlaceholder")}
            value={service.time}
            onChange={handleChange}
            required
          />

          <select name="category" value={service.category} onChange={handleChange}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t(`createService.categories.${cat}`)}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="location"
            placeholder={t("createService.form.locationPlaceholder")}
            value={service.location}
            onChange={handleChange}
          />

          <label className="cs-checkbox-label">
            <input
              type="checkbox"
              name="isFeatured"
              checked={service.isFeatured}
              onChange={handleChange}
            />
            {t("createService.form.markFeatured")}
          </label>

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && <img src={preview} alt="preview" className="cs-file-preview" />}

          <button type="submit" disabled={loading} className="cs-btn-primary">
            {loading ? t("createService.form.creating") : t("createService.form.create")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateService;