import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetCategory.css";

const emptyForm = {
  name: "",
  description: "",
  language: "",
};

const GetCategory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  // Which language's categories the admin is currently viewing.
  // Since the admin api.js sends no Accept-Language header on its own,
  // this dropdown is the ONLY thing that decides which language gets fetched.
  const [filterLanguageCode, setFilterLanguageCode] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  // Load the language list once, then default the viewing filter to the
  // first one available
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        const langData = Array.isArray(res.data) ? res.data : res.data.languages;
        setLanguages(langData || []);

        if (langData && langData.length > 0) {
          setFilterLanguageCode(langData[0].code);
        }
      } catch (err) {
        console.log(err);
        setError(t("getCategory.errors.loadLanguages"));
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch categories whenever the viewing language changes
  useEffect(() => {
    if (!filterLanguageCode) return;
    fetchCategories(filterLanguageCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLanguageCode]);

  const fetchCategories = async (languageCode) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/categories", {
        headers: { "Accept-Language": languageCode },
      });

      setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getCategory.errors.loadCategories"));
    } finally {
      setLoading(false);
    }
  };

  const getLanguageLabel = (languageId) => {
    const match = languages.find((l) => l._id === languageId);
    return match ? `${match.name} (${match.code})` : "—";
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (category) => {
    setEditingId(category._id);
    setFormError("");
    setForm({
      name: category.name || "",
      description: category.description || "",
      language: category.language || "",
    });

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      await API.put(`/categories/${editingId}`, {
        name: form.name,
        description: form.description,
        language: form.language,
      });

      alert(t("getCategory.updateSuccess"));
      handleCancelEdit();
      await fetchCategories(filterLanguageCode);
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("getCategory.errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (category) => {
    const confirmed = window.confirm(t("getCategory.confirmDelete", { name: category.name }));
    if (!confirmed) return;

    try {
      setDeletingId(category._id);

      await API.delete(`/categories/${category._id}`);

      if (editingId === category._id) {
        handleCancelEdit();
      }

      await fetchCategories(filterLanguageCode);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getCategory.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="gc-page">
      <div className="gc-card">
        <div className="gc-header">
          <h2>{t("getCategory.heading")}</h2>

          {!editingId && (
            <button className="gc-btn-new" onClick={() => navigate("/admin/categories/create")}>
              {t("getCategory.newCategory")}
            </button>
          )}
        </div>

        {!editingId && (
          <div className="gc-filter-row">
            <label htmlFor="viewing-language" className="gc-filter-label">
              {t("getCategory.viewingLanguage")}
            </label>
            <select
              id="viewing-language"
              className="gc-filter-select"
              value={filterLanguageCode}
              onChange={(e) => setFilterLanguageCode(e.target.value)}
              disabled={languagesLoading}
            >
              {languages.map((lang) => (
                <option key={lang._id} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="gc-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="gc-edit-panel">
            <h3>{t("getCategory.editHeading")}</h3>

            {formError && <p className="gc-error">{formError}</p>}

            <form onSubmit={handleSubmit} className="gc-form">
              <input
                type="text"
                name="name"
                placeholder={t("getCategory.form.namePlaceholder")}
                value={form.name}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder={t("getCategory.form.descriptionPlaceholder")}
                value={form.description}
                onChange={handleChange}
                rows="5"
              />

              <select name="language" value={form.language} onChange={handleChange} required>
                <option value="" disabled>
                  {t("getCategory.form.selectLanguage")}
                </option>
                {languages.map((lang) => (
                  <option key={lang._id} value={lang._id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <div className="gc-form-actions">
                <button type="submit" disabled={submitting} className="gc-btn-primary">
                  {submitting ? t("getCategory.form.saving") : t("getCategory.form.saveChanges")}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="gc-btn-cancel"
                >
                  {t("getCategory.form.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId &&
          (loading ? (
            <p>{t("getCategory.loadingCategories")}</p>
          ) : categories.length === 0 ? (
            <p>{t("getCategory.noCategories")}</p>
          ) : (
            <div className="gc-table-wrap">
              <table className="gc-table">
                <thead>
                  <tr>
                    <th>{t("getCategory.table.name")}</th>
                    <th>{t("getCategory.table.description")}</th>
                    <th>{t("getCategory.table.language")}</th>
                    <th>{t("getCategory.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td data-label={t("getCategory.table.name")}>{cat.name}</td>
                      <td data-label={t("getCategory.table.description")}>{cat.description || "—"}</td>
                      <td data-label={t("getCategory.table.language")}>{getLanguageLabel(cat.language)}</td>
                      <td data-label={t("getCategory.table.actions")}>
                        <div className="gc-row-actions">
                          <button className="gc-btn-edit" onClick={() => handleEditClick(cat)}>
                            {t("getCategory.actions.edit")}
                          </button>

                          <button
                            className="gc-btn-delete"
                            onClick={() => handleDelete(cat)}
                            disabled={deletingId === cat._id}
                          >
                            {deletingId === cat._id
                              ? t("getCategory.actions.deleting")
                              : t("getCategory.actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
};

export default GetCategory;