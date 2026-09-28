import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreateService.css";
import "../shared/AdminShared.css";

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

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

        // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
        if (res.data?.length) {
          setService((prev) => ({
            ...prev,
            language: prev.language || res.data[0].id,
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

    // title/day/time are now RichTextField (contenteditable), not native
    // inputs, so `required` can't validate them — check the plain text instead.
    if (!stripHtml(service.title)) {
      setError(t("createService.errors.titleRequired"));
      return;
    }

    if (!stripHtml(service.day)) {
      setError(t("createService.errors.dayRequired"));
      return;
    }

    if (!stripHtml(service.time)) {
      setError(t("createService.errors.timeRequired"));
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
        language: languages[0]?.id || "",
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
    <div className="csvc-page">
      <div className="csvc-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2 className="csvc-title">{t("createService.heading")}</h2>

            {error && <p className="csvc-error">{error}</p>}

            <form onSubmit={handleSubmit} className="csvc-form">
              <select name="language" value={service.language} onChange={handleChange} required>
                <option value="" disabled>
                  {t("createService.form.selectLanguage")}
                </option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <RichTextField
                value={service.title}
                onChange={(html) => setService((prev) => ({ ...prev, title: html }))}
                placeholder={t("createService.form.titlePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <RichTextField
                value={service.description}
                onChange={(html) => setService((prev) => ({ ...prev, description: html }))}
                placeholder={t("createService.form.descriptionPlaceholder")}
                minHeight="140px"
              />

              <RichTextField
                value={service.day}
                onChange={(html) => setService((prev) => ({ ...prev, day: html }))}
                placeholder={t("createService.form.dayPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <RichTextField
                value={service.time}
                onChange={(html) => setService((prev) => ({ ...prev, time: html }))}
                placeholder={t("createService.form.timePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <select name="category" value={service.category} onChange={handleChange}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`createService.categories.${cat}`)}
                  </option>
                ))}
              </select>

              <RichTextField
                value={service.location}
                onChange={(html) => setService((prev) => ({ ...prev, location: html }))}
                placeholder={t("createService.form.locationPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <label className="csvc-checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={service.isFeatured}
                  onChange={handleChange}
                />
                {t("createService.form.markFeatured")}
              </label>

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {preview && <img src={preview} alt="preview" className="csvc-file-preview" />}

              <button type="submit" disabled={loading} className="csvc-btn-primary">
                {loading ? t("createService.form.creating") : t("createService.form.create")}
              </button>
            </form>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateService;