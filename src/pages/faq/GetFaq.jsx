import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./GetFaq.css";

// Strips HTML tags for plain-text display/validation
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const GetFaq = () => {
  const { t } = useTranslation();

  const [entries, setEntries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/faq");
      setEntries(res.data || []);
    } catch (err) {
      console.log(err);
      setError(t("getFaq.errors.fetch"));
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const res = await API.get("/languages");
      setLanguages(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch valid categories from the backend (schema enum), not a local hardcoded list
  const fetchCategories = async () => {
    try {
      const res = await API.get("/faq/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchLanguages();
    fetchCategories();
  }, []);

  const startEdit = (entry) => {
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    setEditingId(entry.id);
    setEditData({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      order: entry.order,
      language: entry.language?.id || entry.language,
    });
    setFormError("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setFormError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    setFormError("");

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(editData.question)) {
      setFormError(t("getFaq.errors.questionRequired"));
      return;
    }
    if (!stripHtml(editData.answer)) {
      setFormError(t("getFaq.errors.answerRequired"));
      return;
    }

    try {
      setSaving(true);
      const res = await API.put(`/faq/${id}`, editData);
      // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
      setEntries((prev) => prev.map((entry) => (entry.id === id ? res.data : entry)));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("getFaq.errors.update"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("getFaq.confirmDelete"))) return;

    try {
      await API.delete(`/faq/${id}`);
      // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getFaq.errors.delete"));
    }
  };

  return (
    <div className="gfaq-page">
      <div className="gfaq-card">
        <h2>{t("getFaq.heading")}</h2>

        {error && <p className="gfaq-error">{error}</p>}

        {editingId && (
          <div className="gfaq-edit-panel rte-page-shell">
            <RichTextProvider>
            <div className="rte-editor-shell">
              <RichTextToolbar />
              <RichTextContextMenu />
              <div className="rte-scroll-area">
                {formError && <p className="gfaq-error">{formError}</p>}

                <div className="gfaq-edit-form">
                  <select
                    name="language"
                    value={editData.language}
                    onChange={handleEditChange}
                    className="gfaq-select"
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                  </select>

                  <select
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                    className="gfaq-select"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <RichTextField
                    value={editData.question}
                    onChange={(html) => setEditData((prev) => ({ ...prev, question: html }))}
                    placeholder={t("getFaq.form.questionPlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                    autoFocus
                  />

                  <RichTextField
                    value={editData.answer}
                    onChange={(html) => setEditData((prev) => ({ ...prev, answer: html }))}
                    placeholder={t("getFaq.form.answerPlaceholder")}
                    minHeight="160px"
                  />

                  <input
                    type="number"
                    name="order"
                    value={editData.order}
                    onChange={handleEditChange}
                    placeholder={t("getFaq.form.orderPlaceholder")}
                  />

                  <div className="gfaq-edit-actions">
                    <button
                      className="gfaq-btn-save"
                      disabled={saving}
                      onClick={() => handleSave(editingId)}
                    >
                      {saving ? t("getFaq.saving") : t("getFaq.save")}
                    </button>
                    <button className="gfaq-btn-cancel" onClick={cancelEdit}>
                      {t("getFaq.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </RichTextProvider>
          </div>
        )}

        {!editingId &&
          (loading ? (
            <p className="gfaq-loading">{t("getFaq.loading")}</p>
          ) : entries.length === 0 ? (
            <p className="gfaq-empty">{t("getFaq.empty")}</p>
          ) : (
            <div className="gfaq-list">
              {entries.map((entry) => (
                <div key={entry.id} className="gfaq-row">
                  <div className="gfaq-row-header">
                    <span className="gfaq-category-badge">{entry.category}</span>
                    <span className="gfaq-order">#{entry.order}</span>
                  </div>
                  <h3>{stripHtml(entry.question)}</h3>
                  <p>{stripHtml(entry.answer)}</p>
                  <div className="gfaq-row-actions">
                    <button className="gfaq-btn-edit" onClick={() => startEdit(entry)}>
                      {t("getFaq.edit")}
                    </button>
                    <button className="gfaq-btn-delete" onClick={() => handleDelete(entry.id)}>
                      {t("getFaq.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default GetFaq;