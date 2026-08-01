import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetLanguage.css";

const emptyForm = {
  name: "",
  code: "",
};

const GetLanguage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/languages");

      setLanguages(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getLanguage.errors.loadLanguages"));
    } finally {
      setLoading(false);
    }
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (language) => {
    setEditingId(language._id);
    setFormError("");
    setForm({
      name: language.name || "",
      code: language.code || "",
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

      await API.put(`/languages/${editingId}`, {
        name: form.name,
        code: form.code.toUpperCase(),
      });

      alert(t("getLanguage.updateSuccess"));
      handleCancelEdit();
      await fetchLanguages();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("getLanguage.errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (language) => {
    const confirmed = window.confirm(
      t("getLanguage.confirmDelete", { name: language.name, code: language.code })
    );
    if (!confirmed) return;

    try {
      setDeletingId(language._id);

      await API.delete(`/languages/${language._id}`);

      if (editingId === language._id) {
        handleCancelEdit();
      }

      await fetchLanguages();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getLanguage.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="gl-page">
      <div className="gl-card">
        <div className="gl-header">
          <h2>{t("getLanguage.heading")}</h2>

          {!editingId && (
            <button className="gl-btn-new" onClick={() => navigate("/admin/languages/create")}>
              {t("getLanguage.newLanguage")}
            </button>
          )}
        </div>

        {error && <p className="gl-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="gl-edit-panel">
            <h3>{t("getLanguage.editHeading")}</h3>

            {formError && <p className="gl-error">{formError}</p>}

            <form onSubmit={handleSubmit} className="gl-form">
              <input
                type="text"
                name="name"
                placeholder={t("getLanguage.form.namePlaceholder")}
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="code"
                placeholder={t("getLanguage.form.codePlaceholder")}
                value={form.code}
                onChange={handleChange}
                required
                className="gl-code-input"
              />

              <div className="gl-form-actions">
                <button type="submit" disabled={submitting} className="gl-btn-primary">
                  {submitting ? t("getLanguage.form.saving") : t("getLanguage.form.saveChanges")}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="gl-btn-cancel"
                >
                  {t("getLanguage.form.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId &&
          (loading ? (
            <p>{t("getLanguage.loadingLanguages")}</p>
          ) : languages.length === 0 ? (
            <p>{t("getLanguage.noLanguages")}</p>
          ) : (
            <div className="gl-table-wrap">
              <table className="gl-table">
                <thead>
                  <tr>
                    <th>{t("getLanguage.table.name")}</th>
                    <th>{t("getLanguage.table.code")}</th>
                    <th>{t("getLanguage.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((lang) => (
                    <tr key={lang._id}>
                      <td data-label={t("getLanguage.table.name")}>{lang.name}</td>
                      <td data-label={t("getLanguage.table.code")}>
                        <span className="gl-code-badge">{lang.code}</span>
                      </td>
                      <td data-label={t("getLanguage.table.actions")}>
                        <div className="gl-row-actions">
                          <button className="gl-btn-edit" onClick={() => handleEditClick(lang)}>
                            {t("getLanguage.actions.edit")}
                          </button>

                          <button
                            className="gl-btn-delete"
                            onClick={() => handleDelete(lang)}
                            disabled={deletingId === lang._id}
                          >
                            {deletingId === lang._id
                              ? t("getLanguage.actions.deleting")
                              : t("getLanguage.actions.delete")}
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

export default GetLanguage;