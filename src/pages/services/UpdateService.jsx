import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./UpdateService.css";
import "../shared/AdminShared.css";

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

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
          language: data.languageId || data.language?.id || "",
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

    // title/day/time are now RichTextField (contenteditable), not native
    // inputs, so `required` can't validate them — check the plain text instead.
    if (!stripHtml(service.title)) {
      setError(t("updateService.errors.titleRequired"));
      return;
    }

    if (!stripHtml(service.day)) {
      setError(t("updateService.errors.dayRequired"));
      return;
    }

    if (!stripHtml(service.time)) {
      setError(t("updateService.errors.timeRequired"));
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

  if (loading) return <p className="usvc-page">{t("updateService.loading")}</p>;

  return (
    <div className="usvc-page">
      <div className="usvc-edit-panel rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h3>{t("updateService.heading")}</h3>

            {error && <p className="usvc-error">{error}</p>}

            <form onSubmit={handleSubmit} className="usvc-form">
              <select name="language" value={service.language} onChange={handleChange} required>
                <option value="" disabled>
                  {t("updateService.form.selectLanguage")}
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
                placeholder={t("updateService.form.titlePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <RichTextField
                value={service.description}
                onChange={(html) => setService((prev) => ({ ...prev, description: html }))}
                placeholder={t("updateService.form.descriptionPlaceholder")}
                minHeight="140px"
              />

              <RichTextField
                value={service.day}
                onChange={(html) => setService((prev) => ({ ...prev, day: html }))}
                placeholder={t("updateService.form.dayPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <RichTextField
                value={service.time}
                onChange={(html) => setService((prev) => ({ ...prev, time: html }))}
                placeholder={t("updateService.form.timePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <select name="category" value={service.category} onChange={handleChange}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`updateService.categories.${cat}`)}
                  </option>
                ))}
              </select>

              <RichTextField
                value={service.location}
                onChange={(html) => setService((prev) => ({ ...prev, location: html }))}
                placeholder={t("updateService.form.locationPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <label className="usvc-checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={service.isFeatured}
                  onChange={handleChange}
                />
                {t("updateService.form.markFeatured")}
              </label>

              {existingImage && !preview && (
                <div className="usvc-current-image">
                  <span>{t("updateService.form.currentImage")}</span>
                  <img src={existingImage} alt="current" className="usvc-file-preview" />
                </div>
              )}

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {preview && <img src={preview} alt="preview" className="usvc-file-preview" />}

              <div className="usvc-form-actions">
                <button type="submit" disabled={saving} className="usvc-btn-primary">
                  {saving ? t("updateService.form.updating") : t("updateService.form.update")}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  className="usvc-btn-cancel"
                  onClick={handleCancel}
                >
                  {t("updateService.form.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default UpdateService;