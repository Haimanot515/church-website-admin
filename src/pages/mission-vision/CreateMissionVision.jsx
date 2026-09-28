import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreateMissionVision.css";
import "../shared/AdminShared.css";

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreateMissionVision = () => {
  const { t } = useTranslation();

  const [missionVision, setMissionVision] = useState({
    type: "mission",
    title: "",
    desc: "",
    order: 0,
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);
        // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
        if (res.data?.length) {
          setMissionVision((prev) => ({ ...prev, language: prev.language || res.data[0].id }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMissionVision((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!missionVision.language) {
      setError(t("createMissionVision.errors.languageRequired"));
      return;
    }

    // title/desc are now RichTextField (contenteditable), not native
    // inputs, so `required` can't validate them — check the plain text instead.
    if (!stripHtml(missionVision.title)) {
      setError(t("createMissionVision.errors.titleRequired"));
      return;
    }

    if (!stripHtml(missionVision.desc)) {
      setError(t("createMissionVision.errors.descRequired"));
      return;
    }

    try {
      setLoading(true);

      // Auth header is already attached globally by the API interceptor
      await API.post("/mission-vision", missionVision);

      alert(t("createMissionVision.successMessage"));

      setMissionVision({
        type: "mission",
        title: "",
        desc: "",
        order: 0,
        language: languages[0]?.id || "",
      });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createMissionVision.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmv-page">
      <div className="cmv-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2>{t("createMissionVision.heading")}</h2>

            {error && <p className="cmv-error">{error}</p>}

            <form onSubmit={handleSubmit} className="cmv-form">
              <select
                name="language"
                value={missionVision.language}
                onChange={handleChange}
                required
                className="cmv-select"
              >
                <option value="" disabled>
                  {t("createMissionVision.form.selectLanguage")}
                </option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <select
                name="type"
                value={missionVision.type}
                onChange={handleChange}
                required
                className="cmv-select"
              >
                <option value="mission">{t("createMissionVision.form.typeMission")}</option>
                <option value="vision">{t("createMissionVision.form.typeVision")}</option>
              </select>

              <RichTextField
                value={missionVision.title}
                onChange={(html) => setMissionVision((prev) => ({ ...prev, title: html }))}
                placeholder={t("createMissionVision.form.titlePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <RichTextField
                value={missionVision.desc}
                onChange={(html) => setMissionVision((prev) => ({ ...prev, desc: html }))}
                placeholder={t("createMissionVision.form.descPlaceholder")}
                minHeight="160px"
              />

              <input
                type="number"
                name="order"
                placeholder={t("createMissionVision.form.orderPlaceholder")}
                value={missionVision.order}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading} className="cmv-btn-primary">
                {loading ? t("createMissionVision.form.creating") : t("createMissionVision.form.createButton")}
              </button>
            </form>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateMissionVision;