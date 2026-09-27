import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./GetCategory.css";

// Strips HTML tags for plain-text display/validation
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const emptyForm = {
  name: "",
  slug: "",
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

  // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
  const getLanguageLabel = (languageId) => {
    const match = languages.find((l) => l.id === languageId);
    return match ? `${match.name} (${match.code})` : "—";
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (category) => {
    setEditingId(category.id);
    setFormError("");
    setForm({
      name: category.name || "",
      slug: category.slug || "",
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

  // slugs are lowercase, hyphenated, no spaces/punctuation — so
  // "Travel" and "travel " both normalize to "travel"
  const normalizeSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleSlugChange = (e) => {
    setForm((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(form.name)) {
      setFormError(t("getCategory.errors.nameRequired"));
      return;
    }

    try {
      setSubmitting(true);
      await API.put(`/categories/${editingId}`, {
        name: form.name,
        slug: form.slug,
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
    const confirmed = window.confirm(t("getCategory.confirmDelete", { name: stripHtml(category.name) }));
    if (!confirmed) return;

    try {
      setDeletingId(category.id);

      await API.delete(`/categories/${category.id}`);

      if (editingId === category.id) {
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
                <option key={lang.id} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="gc-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="gc-edit-panel rte-page-shell">
            <RichTextProvider>
            <div className="rte-editor-shell">
              <RichTextToolbar />
              <RichTextContextMenu />
              <div className="rte-scroll-area">
                <h3>{t("getCategory.editHeading")}</h3>

                {formError && <p className="gc-error">{formError}</p>}

                <form onSubmit={handleSubmit} className="gc-form">
                  <RichTextField
                    value={form.name}
                    onChange={(html) => setForm((prev) => ({ ...prev, name: html }))}
                    placeholder={t("getCategory.form.namePlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                    autoFocus
                  />

                  <input
                    type="text"
                    name="slug"
                    placeholder={t(
                      "getCategory.form.slugPlaceholder",
                      "Slug (e.g. travel) — same slug across all languages for this category"
                    )}
                    value={form.slug}
                    onChange={handleSlugChange}
                    required
                  />

                  <RichTextField
                    value={form.description}
                    onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                    placeholder={t("getCategory.form.descriptionPlaceholder")}
                    minHeight="140px"
                  />

                  <select name="language" value={form.language} onChange={handleChange} required>
                    <option value="" disabled>
                      {t("getCategory.form.selectLanguage")}
                    </option>
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
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
            </div>
            </RichTextProvider>
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
                    <th>{t("getCategory.table.slug", "Slug")}</th>
                    <th>{t("getCategory.table.description")}</th>
                    <th>{t("getCategory.table.language")}</th>
                    <th>{t("getCategory.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td data-label={t("getCategory.table.name")}>{stripHtml(cat.name)}</td>
                      <td data-label={t("getCategory.table.slug", "Slug")}>
                        {cat.slug || (
                          <span className="gc-slug-missing">
                            {t("getCategory.table.slugMissing", "missing")}
                          </span>
                        )}
                      </td>
                      <td data-label={t("getCategory.table.description")}>{stripHtml(cat.description) || "—"}</td>
                      <td data-label={t("getCategory.table.language")}>{getLanguageLabel(cat.language)}</td>
                      <td data-label={t("getCategory.table.actions")}>
                        <div className="gc-row-actions">
                          <button className="gc-btn-edit" onClick={() => handleEditClick(cat)}>
                            {t("getCategory.actions.edit")}
                          </button>
                          <button
                            className="gc-btn-delete"
                            onClick={() => handleDelete(cat)}
                            disabled={deletingId === cat.id}
                          >
                            {deletingId === cat.id
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