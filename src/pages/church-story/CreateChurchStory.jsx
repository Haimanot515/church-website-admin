import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./createChurchStory.css";

const CreateChurchStory = () => {
  const { t } = useTranslation();

  const [story, setStory] = useState({
    title: "",
    desc: "",
    leader: "",
    leaderRole: "",
    range: "",
    servedBy: "",
    order: 0,
    year: "",
    language: "",
    file: null,
  });

  const [languages, setLanguages] = useState([]);

  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch available languages so the chapter can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");

        setLanguages(res.data || []);

        if (res.data?.length) {
          setStory((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
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

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", story.title);
      formData.append("desc", story.desc);
      formData.append("leader", story.leader);
      formData.append("leaderRole", story.leaderRole);
      formData.append("range", story.range);
      formData.append("servedBy", story.servedBy);
      formData.append("order", story.order);
      formData.append("language", story.language);

      // Only append year if a value was actually entered — sending an empty
      // string can fail schema validation if year is typed as a Number.
      if (story.year) {
        formData.append("year", story.year);
      }

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
        order: 0,
        year: "",
        language: languages[0]?._id || "",
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

  return (
    <div className="ccsPage">
      <div className="ccsCard">
        <h2 className="ccsHeading">{t("createChurchStory.heading")}</h2>

        {error && <p className="ccsError">{error}</p>}

        <form onSubmit={handleSubmit} className="ccsForm">
          <select
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
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <input
            type="text"
            name="title"
            placeholder={t("createChurchStory.titlePlaceholder")}
            value={story.title}
            onChange={handleChange}
            required
            className="ccsInput"
          />

          <div className="ccsFieldRow">
            <input
              type="text"
              name="leader"
              placeholder={t("createChurchStory.leaderPlaceholder")}
              value={story.leader}
              onChange={handleChange}
              className="ccsInput"
            />

            <input
              type="text"
              name="leaderRole"
              placeholder={t("createChurchStory.leaderRolePlaceholder")}
              value={story.leaderRole}
              onChange={handleChange}
              className="ccsInput"
            />
          </div>

          <div className="ccsFieldRow">
            <input
              type="text"
              name="range"
              placeholder={t("createChurchStory.rangePlaceholder")}
              value={story.range}
              onChange={handleChange}
              className="ccsInput"
            />

            <input
              type="text"
              name="servedBy"
              placeholder={t("createChurchStory.servedByPlaceholder")}
              value={story.servedBy}
              onChange={handleChange}
              className="ccsInput"
            />
          </div>

          <div className="ccsFieldRow">
            <input
              type="number"
              name="order"
              placeholder={t("createChurchStory.orderPlaceholder")}
              value={story.order}
              onChange={handleChange}
              min="0"
              className="ccsInput"
            />

            <input
              type="number"
              name="year"
              placeholder={t("createChurchStory.yearPlaceholder")}
              value={story.year}
              onChange={handleChange}
              className="ccsInput"
            />
          </div>

          <textarea
            name="desc"
            placeholder={t("createChurchStory.descPlaceholder")}
            rows="5"
            value={story.desc}
            onChange={handleChange}
            className="ccsTextarea"
          />

          <input
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
  );
};

export default CreateChurchStory;