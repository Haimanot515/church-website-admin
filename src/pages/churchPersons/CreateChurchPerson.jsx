import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateChurchPerson.css";

const CATEGORY_OPTIONS = [
  { value: "leader", labelKey: "categories.leader" },
  { value: "specialThanks", labelKey: "categories.specialThanks" },
  { value: "testimony", labelKey: "categories.testimony" },
];

const CreateChurchPerson = () => {
  const { t } = useTranslation("translation", { keyPrefix: "createChurchPerson" });

  const [person, setPerson] = useState({
    name: "",
    description: "",
    role: "",
    category: "leader",
    language: "",
    files: [],
  });

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Revoke previous preview URLs whenever they change or the component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);
      } catch (err) {
        console.log(err);
        setError(t("errorMessage"));
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    setPerson({
      ...person,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setPerson({
      ...person,
      files: selectedFiles,
    });

    if (selectedFiles.length > 0) {
      setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
    } else {
      setPreviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!person.language) {
      setError(t("selectLanguageError"));
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", person.name);
      formData.append("description", person.description);
      formData.append("role", person.role);
      formData.append("category", person.category);
      formData.append("language", person.language);

      if (person.files && person.files.length > 0) {
        person.files.forEach((file) => {
          formData.append("photos", file);
        });
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/church-persons", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("successMessage"));

      setPerson({
        name: "",
        description: "",
        role: "",
        category: "leader",
        language: languages[0]?._id || "",
        files: [],
      });

      setPreviews([]);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createChurchPerson-page">
      <div className="createChurchPerson-card">
        <h2 className="createChurchPerson-title">{t("title")}</h2>

        {error && <p className="createChurchPerson-error">{error}</p>}

        {languagesLoading ? (
          <>
            <style>{`
              .createChurchPerson-spinner {
                width: 40px;
                height: 40px;
                margin: 40px auto;
                border: 4px solid #e0e0e0;
                border-top-color: #4a4a4a;
                border-radius: 50%;
                animation: createChurchPerson-spin 0.8s linear infinite;
              }
              @keyframes createChurchPerson-spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
            <div className="createChurchPerson-spinner" role="status" aria-label={t("loadingLanguages")} />
          </>
        ) : (
          <form onSubmit={handleSubmit} className="createChurchPerson-form">
            <select
              name="language"
              value={person.language}
              onChange={handleChange}
              required
              className="createChurchPerson-select"
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

            <input
              type="text"
              name="name"
              placeholder={t("namePlaceholder")}
              value={person.name}
              onChange={handleChange}
              required
              className="createChurchPerson-input"
            />

            <input
              type="text"
              name="role"
              placeholder={t("rolePlaceholder")}
              value={person.role}
              onChange={handleChange}
              className="createChurchPerson-input"
            />

            <select
              name="category"
              value={person.category}
              onChange={handleChange}
              className="createChurchPerson-select"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>

            <textarea
              name="description"
              placeholder={t("descriptionPlaceholder")}
              rows="4"
              value={person.description}
              onChange={handleChange}
              className="createChurchPerson-textarea"
            />

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="createChurchPerson-fileInput"
            />

            {previews.length > 0 && (
              <div className="createChurchPerson-previewGrid">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={t("previewAlt", { index: i })}
                    className="createChurchPerson-preview"
                  />
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="createChurchPerson-submitButton">
              {loading ? t("submittingButton") : t("submitButton")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateChurchPerson;