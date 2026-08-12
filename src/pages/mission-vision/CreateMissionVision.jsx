import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateMissionVision.css";

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
        if (res.data?.length) {
          setMissionVision((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
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
        language: languages[0]?._id || "",
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
      <div className="cmv-card">
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
              <option key={lang._id} value={lang._id}>
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

          <input
            type="text"
            name="title"
            placeholder={t("createMissionVision.form.titlePlaceholder")}
            value={missionVision.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="desc"
            placeholder={t("createMissionVision.form.descPlaceholder")}
            value={missionVision.desc}
            onChange={handleChange}
            rows="6"
            required
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
  );
};

export default CreateMissionVision;