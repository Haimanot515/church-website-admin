import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreateChurchStory.css";
import "../shared/AdminShared.css";

// Strips HTML tags for plain-text validation checks
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreateChurchStory = () => {
  const { t } = useTranslation();

  const [story, setStory] = useState({
    title: "",
    desc: "",
    leader: "",
    leaderRole: "",
    range: "",
    servedBy: "",
    language: "",
    file: null,
  });

  const [languages, setLanguages] = useState([]);

  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // Controls the initial fetch of languages — while true, the form is
  // hidden and a centered spinner is shown instead.
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch available languages so the story can be tied to one.
  // Defaults the selection to English when it's present in the list.
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        const langs = res.data || [];

        setLanguages(langs);

        if (langs.length) {
          const englishLang = langs.find(
            (l) => l.code?.toLowerCase() === "en" || l.name?.toLowerCase() === "english"
          );

          // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
          setStory((prev) => ({
            ...prev,
            language: prev.language || (englishLang || langs[0]).id,
          }));
        }
      } catch (err) {
        console.log(err);
        setError(t("createChurchStory.errorLoadLanguages"));
      } finally {
        setPageLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Revoke the previous preview URL whenever it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    setStory({
      ...story,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setStory({
      ...story,
      file: selectedFile || null,
    });

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!story.language) {
      setError(t("createChurchStory.errorLanguageRequired"));
      return;
    }

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(story.title)) {
      setError(t("createChurchStory.errorTitleRequired"));
      return;
    }
    if (!stripHtml(story.desc)) {
      setError(t("createChurchStory.errorDescRequired"));
      return;
    }

    // The backend derives `year` and `order` from `range`, and requires
    // a 4-digit year inside it (e.g. "1998 - 2006"). Catch that early
    // instead of waiting for the schema validator to reject it.
    if (!/\d{4}/.test(story.range)) {
      setError(t("createChurchStory.errorRangeYearRequired"));
      return;
    }

    if (!stripHtml(story.range)) {
      setError("Range is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", story.title);
      formData.append("desc", story.desc);
      formData.append("leader", story.leader);
      formData.append("leaderRole", story.leaderRole);
      formData.append("range", story.range);
      formData.append("servedBy", story.servedBy);
      formData.append("language", story.language);

      if (story.file) {
        formData.append("photo", story.file);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/church-story", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("createChurchStory.successMessage"));

      setStory({
        title: "",
        desc: "",
        leader: "",
        leaderRole: "",
        range: "",
        servedBy: "",
        language: languages[0]?.id || "",
        file: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || t("createChurchStory.errorSubmit"));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="ccsPage">
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
              animation: "ccsSpin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes ccsSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="ccsPage">
      <div className="ccsCard rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2 className="ccsHeading">{t("createChurchStory.heading")}</h2>

            {error && <p className="ccsError">{error}</p>}

            <form onSubmit={handleSubmit} className="ccsForm">
              <label className="ccsLabel" htmlFor="ccs-language">
                {t("createChurchStory.languageLabel")}
                <span className="ccsRequired"> *</span>
              </label>
              <select
                id="ccs-language"
                name="language"
                value={story.language}
                onChange={handleChange}
                required
                className="ccsSelect"
              >
                <option value="" disabled>
                  {t("createChurchStory.languageSelectPlaceholder")}
                </option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <label className="ccsLabel" htmlFor="ccs-title">
                {t("createChurchStory.titleLabel")}
                <span className="ccsRequired"> *</span>
              </label>
              <RichTextField
                id="ccs-title"
                value={story.title}
                onChange={(html) => setStory((prev) => ({ ...prev, title: html }))}
                placeholder={t("createChurchStory.titlePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <label className="ccsLabel" htmlFor="ccs-range">
                {t("createChurchStory.rangeLabel")}
                <span className="ccsRequired"> *</span>
              </label>
              <RichTextField
                id="ccs-range"
                value={story.range}
                onChange={(html) => setStory((prev) => ({ ...prev, range: html }))}
                placeholder={t("createChurchStory.rangePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <label className="ccsLabel" htmlFor="ccs-desc">
                {t("createChurchStory.descLabel")}
                <span className="ccsRequired"> *</span>
              </label>
              <RichTextField
                id="ccs-desc"
                value={story.desc}
                onChange={(html) => setStory((prev) => ({ ...prev, desc: html }))}
                placeholder={t("createChurchStory.descPlaceholder")}
                minHeight="160px"
              />

              <div className="ccsFieldRow">
                <div className="ccsFieldCol">
                  <label className="ccsLabel" htmlFor="ccs-leader">
                    {t("createChurchStory.leaderLabel")}
                    <span className="ccsOptional"> ({t("createChurchStory.optional")})</span>
                  </label>
                  <RichTextField
                    id="ccs-leader"
                    value={story.leader}
                    onChange={(html) => setStory((prev) => ({ ...prev, leader: html }))}
                    placeholder={t("createChurchStory.leaderPlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                  />
                </div>

                <div className="ccsFieldCol">
                  <label className="ccsLabel" htmlFor="ccs-leaderRole">
                    {t("createChurchStory.leaderRoleLabel")}
                    <span className="ccsOptional"> ({t("createChurchStory.optional")})</span>
                  </label>
                  <RichTextField
                    id="ccs-leaderRole"
                    value={story.leaderRole}
                    onChange={(html) => setStory((prev) => ({ ...prev, leaderRole: html }))}
                    placeholder={t("createChurchStory.leaderRolePlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                  />
                </div>
              </div>

              <label className="ccsLabel" htmlFor="ccs-servedBy">
                {t("createChurchStory.servedByLabel")}
                <span className="ccsOptional"> ({t("createChurchStory.optional")})</span>
              </label>
              <RichTextField
                id="ccs-servedBy"
                value={story.servedBy}
                onChange={(html) => setStory((prev) => ({ ...prev, servedBy: html }))}
                placeholder={t("createChurchStory.servedByPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />

              <label className="ccsLabel" htmlFor="ccs-file">
                {t("createChurchStory.photoLabel")}
                <span className="ccsOptional"> ({t("createChurchStory.optional")})</span>
              </label>
              <input
                id="ccs-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="ccsFileInput"
              />

              {preview && (
                <div className="ccsPreviewWrap">
                  <img src={preview} alt={t("createChurchStory.previewAlt")} className="ccsPreview" />
                </div>
              )}

              <button type="submit" disabled={loading} className="ccsSubmitButton">
                {loading ? t("createChurchStory.submitting") : t("createChurchStory.submitButton")}
              </button>
            </form>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateChurchStory;