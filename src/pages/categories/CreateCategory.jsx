import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateCategory.css";

const CreateCategory = () => {
  const { t } = useTranslation();

  const [category, setCategory] = useState({
    name: "",
    description: "",
    language: "",
  });

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate the language dropdown from the same collection the backend
  // validates against
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        const langData = Array.isArray(res.data) ? res.data : res.data.languages;
        setLanguages(langData || []);
      } catch (err) {
        console.log(err);
        setError(t("createCategory.errors.loadLanguages"));
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Auth header is already attached globally by the API interceptor
      await API.post("/categories", {
        name: category.name,
        description: category.description,
        language: category.language,
      });

      alert(t("createCategory.successMessage"));
      setCategory({ name: "", description: "", language: "" });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createCategory.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    { name: t("createCategory.examples.sermons.name"), description: t("createCategory.examples.sermons.description") },
    { name: t("createCategory.examples.events.name"), description: t("createCategory.examples.events.description") },
    { name: t("createCategory.examples.testimonies.name"), description: t("createCategory.examples.testimonies.description") },
  ];

  return (
    <div className="cc-page">
      <div className="cc-card">
        <h2>{t("createCategory.heading")}</h2>

        {error && <p className="cc-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cc-form">
          <input
            type="text"
            name="name"
            placeholder={t("createCategory.form.namePlaceholder")}
            value={category.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("createCategory.form.descriptionPlaceholder")}
            value={category.description}
            onChange={handleChange}
            rows="5"
          />

          <select
            name="language"
            value={category.language}
            onChange={handleChange}
            required
            disabled={languagesLoading}
            className="cc-select"
          >
            <option value="" disabled>
              {languagesLoading
                ? t("createCategory.form.loadingLanguages")
                : t("createCategory.form.selectLanguage")}
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading || languagesLoading} className="cc-btn-primary">
            {loading ? t("createCategory.form.creating") : t("createCategory.form.createButton")}
          </button>
        </form>

        <div className="cc-examples">
          <h4>{t("createCategory.examples.heading")}</h4>

          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>{t("createCategory.examples.table.category")}</th>
                  <th>{t("createCategory.examples.table.description")}</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((ex) => (
                  <tr key={ex.name}>
                    <td data-label={t("createCategory.examples.table.category")}>{ex.name}</td>
                    <td data-label={t("createCategory.examples.table.description")}>{ex.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;