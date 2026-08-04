import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateChurchPerson.css";

// Values sent to the backend stay fixed English strings (matching its
// enum/validator); only the displayed label is translated via roles.<key>.
const ROLE_OPTIONS = [
  { value: "", labelKey: null },
  { value: "Founding Pastor", labelKey: "roles.foundingPastor" },
  { value: "Senior Pastor", labelKey: "roles.seniorPastor" },
  { value: "Associate Pastor", labelKey: "roles.associatePastor" },
  { value: "Church Elder", labelKey: "roles.churchElder" },
  { value: "Ministry Assistant", labelKey: "roles.ministryAssistant" },
  { value: "Worship Leader", labelKey: "roles.worshipLeader" },
  { value: "Small Group Leader", labelKey: "roles.smallGroupLeader" },
  { value: "Food Pantry Volunteer", labelKey: "roles.foodPantryVolunteer" },
  { value: "Worship Team Member", labelKey: "roles.worshipTeamMember" },
  { value: "Sunday School Teacher", labelKey: "roles.sundaySchoolTeacher" },
  { value: "Choir Member", labelKey: "roles.choirMember" },
  { value: "Usher", labelKey: "roles.usher" },
  { value: "Treasurer", labelKey: "roles.treasurer" },
  { value: "Secretary", labelKey: "roles.secretary" },
  { value: "Member", labelKey: "roles.member" },
];

const RANK_OPTIONS = [
  { value: "", labelKey: null },
  { value: "patriarch", labelKey: "ranks.patriarch" },
  { value: "archbishop", labelKey: "ranks.archbishop" },
  { value: "bishop", labelKey: "ranks.bishop" },
  { value: "archpriest", labelKey: "ranks.archpriest" },
  { value: "priest", labelKey: "ranks.priest" },
  { value: "deacon", labelKey: "ranks.deacon" },
  { value: "subdeacon", labelKey: "ranks.subdeacon" },
  { value: "elder", labelKey: "ranks.elder" },
  { value: "member", labelKey: "ranks.member" },
];

const CATEGORY_OPTIONS = [
  { value: "leader", labelKey: "categories.leader" },
  { value: "specialThanks", labelKey: "categories.specialThanks" },
  { value: "testimony", labelKey: "categories.testimony" },
];

const CreateChurchPerson = () => {
  const { t } = useTranslation("translation", { keyPrefix: "createChurchPerson" });

  const [person, setPerson] = useState({
    name: "",
    title: "",
    description: "",
    role: "",
    message: "",
    category: "leader",
    rank: "",
    rankOrder: 0,
    language: "",
    files: [],
  });

  const [languages, setLanguages] = useState([]);
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
        if (res.data?.length) {
          setPerson((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
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
      formData.append("title", person.title);
      formData.append("description", person.description);
      formData.append("role", person.role);
      formData.append("message", person.message);
      formData.append("category", person.category);

      // Only append rank if a value was actually selected — sending an empty
      // string fails the backend's enum validator, since "" isn't a valid rank.
      if (person.rank) {
        formData.append("rank", person.rank);
      }

      formData.append("rankOrder", person.rankOrder);
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
        title: "",
        description: "",
        role: "",
        message: "",
        category: "leader",
        rank: "",
        rankOrder: 0,
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

        <form onSubmit={handleSubmit} className="createChurchPerson-form">
          <input
            type="text"
            name="name"
            placeholder={t("namePlaceholder")}
            value={person.name}
            onChange={handleChange}
            required
            className="createChurchPerson-input"
          />

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

          <input
            type="text"
            name="title"
            placeholder={t("titlePlaceholder")}
            value={person.title}
            onChange={handleChange}
            className="createChurchPerson-input"
          />

          <select
            name="role"
            value={person.role}
            onChange={handleChange}
            className="createChurchPerson-select"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelKey ? t(opt.labelKey) : t("selectRole")}
              </option>
            ))}
          </select>

          <select
            name="rank"
            value={person.rank}
            onChange={handleChange}
            className="createChurchPerson-select"
          >
            {RANK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelKey ? t(opt.labelKey) : t("noRank")}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="rankOrder"
            placeholder={t("rankOrderPlaceholder")}
            value={person.rankOrder}
            onChange={handleChange}
            min="0"
            className="createChurchPerson-input"
          />

          <textarea
            name="description"
            placeholder={t("descriptionPlaceholder")}
            rows="4"
            value={person.description}
            onChange={handleChange}
            className="createChurchPerson-textarea"
          />

          <textarea
            name="message"
            placeholder={t("messagePlaceholder")}
            rows="4"
            value={person.message}
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
      </div>
    </div>
  );
};

export default CreateChurchPerson;