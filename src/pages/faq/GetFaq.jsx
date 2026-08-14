import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetFaq.css";

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
    setEditingId(entry._id);
    setEditData({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      order: entry.order,
      language: entry.language?._id || entry.language,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    setError("");
    try {
      setSaving(true);
      const res = await API.put(`/faq/${id}`, editData);
      setEntries((prev) => prev.map((entry) => (entry._id === id ? res.data : entry)));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getFaq.errors.update"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("getFaq.confirmDelete"))) return;

    try {
      await API.delete(`/faq/${id}`);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
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

        {loading ? (
          <p className="gfaq-loading">{t("getFaq.loading")}</p>
        ) : entries.length === 0 ? (
          <p className="gfaq-empty">{t("getFaq.empty")}</p>
        ) : (
          <div className="gfaq-list">
            {entries.map((entry) => {
              const isEditing = editingId === entry._id;

              return (
                <div key={entry._id} className="gfaq-row">
                  {isEditing ? (
                    <div className="gfaq-edit-form">
                      <select
                        name="language"
                        value={editData.language}
                        onChange={handleEditChange}
                        className="gfaq-select"
                      >
                        {languages.map((lang) => (
                          <option key={lang._id} value={lang._id}>
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

                      <input
                        type="text"
                        name="question"
                        value={editData.question}
                        onChange={handleEditChange}
                        placeholder={t("getFaq.form.questionPlaceholder")}
                      />

                      <textarea
                        name="answer"
                        value={editData.answer}
                        onChange={handleEditChange}
                        rows="4"
                        placeholder={t("getFaq.form.answerPlaceholder")}
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
                          onClick={() => handleSave(entry._id)}
                        >
                          {saving ? t("getFaq.saving") : t("getFaq.save")}
                        </button>
                        <button className="gfaq-btn-cancel" onClick={cancelEdit}>
                          {t("getFaq.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="gfaq-row-header">
                        <span className="gfaq-category-badge">{entry.category}</span>
                        <span className="gfaq-order">#{entry.order}</span>
                      </div>
                      <h3>{entry.question}</h3>
                      <p>{entry.answer}</p>
                      <div className="gfaq-row-actions">
                        <button className="gfaq-btn-edit" onClick={() => startEdit(entry)}>
                          {t("getFaq.edit")}
                        </button>
                        <button className="gfaq-btn-delete" onClick={() => handleDelete(entry._id)}>
                          {t("getFaq.delete")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetFaq;