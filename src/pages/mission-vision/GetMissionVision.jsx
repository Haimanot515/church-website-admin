import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./GetMissionVision.css";

// Strips HTML tags for the plain-text read-only view
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const GetMissionVision = () => {
  const { t } = useTranslation();

  const [entries, setEntries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await API.get("/mission-vision");
      setEntries(res.data || []);
    } catch (err) {
      console.log(err);
      setError(t("getMissionVision.errors.fetch"));
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

  useEffect(() => {
    fetchEntries();
    fetchLanguages();
  }, []);

  // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditData({
      type: entry.type,
      title: entry.title,
      desc: entry.desc,
      order: entry.order,
      language: entry.language?.id || entry.language,
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
      const res = await API.put(`/mission-vision/${id}`, editData);
      setEntries((prev) => prev.map((entry) => (entry.id === id ? res.data : entry)));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getMissionVision.errors.update"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("getMissionVision.confirmDelete"))) return;

    try {
      await API.delete(`/mission-vision/${id}`);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getMissionVision.errors.delete"));
    }
  };

  return (
    <div className="gmv-page">
      <div className="gmv-card">
        <h2>{t("getMissionVision.heading")}</h2>

        {error && <p className="gmv-error">{error}</p>}

        {loading ? (
          <p className="gmv-loading">{t("getMissionVision.loading")}</p>
        ) : entries.length === 0 ? (
          <p className="gmv-empty">{t("getMissionVision.empty")}</p>
        ) : (
          <div className="gmv-list">
            {entries.map((entry) => {
              const isEditing = editingId === entry.id;

              return (
                <div key={entry.id} className="gmv-row">
                  {isEditing ? (
                    <div className="gmv-edit-form rte-page-shell">
                      <RichTextProvider>
                      <div className="rte-editor-shell">
                        <RichTextToolbar />
                        <RichTextContextMenu />
                        <div className="rte-scroll-area">
                          <select
                            name="language"
                            value={editData.language}
                            onChange={handleEditChange}
                            className="gmv-select"
                          >
                            {languages.map((lang) => (
                              <option key={lang.id} value={lang.id}>
                                {lang.name} ({lang.code})
                              </option>
                            ))}
                          </select>

                          <select
                            name="type"
                            value={editData.type}
                            onChange={handleEditChange}
                            className="gmv-select"
                          >
                            <option value="mission">{t("getMissionVision.typeMission")}</option>
                            <option value="vision">{t("getMissionVision.typeVision")}</option>
                          </select>

                          <RichTextField
                            value={editData.title}
                            onChange={(html) => setEditData((prev) => ({ ...prev, title: html }))}
                            placeholder={t("getMissionVision.form.titlePlaceholder")}
                            minHeight="44px"
                            toolbar="minimal"
                            autoFocus
                          />

                          <RichTextField
                            value={editData.desc}
                            onChange={(html) => setEditData((prev) => ({ ...prev, desc: html }))}
                            placeholder={t("getMissionVision.form.descPlaceholder")}
                            minHeight="140px"
                          />

                          <input
                            type="number"
                            name="order"
                            value={editData.order}
                            onChange={handleEditChange}
                            placeholder={t("getMissionVision.form.orderPlaceholder")}
                          />

                          <div className="gmv-edit-actions">
                            <button
                              className="gmv-btn-save"
                              disabled={saving}
                              onClick={() => handleSave(entry.id)}
                            >
                              {saving ? t("getMissionVision.saving") : t("getMissionVision.save")}
                            </button>
                            <button className="gmv-btn-cancel" onClick={cancelEdit}>
                              {t("getMissionVision.cancel")}
                            </button>
                          </div>
                        </div>
                      </div>
                      </RichTextProvider>
                    </div>
                  ) : (
                    <>
                      <div className="gmv-row-header">
                        <span className="gmv-type-badge">{entry.type}</span>
                        <span className="gmv-order">#{entry.order}</span>
                      </div>
                      <h3>{stripHtml(entry.title) || "—"}</h3>
                      <p>{stripHtml(entry.desc) || "—"}</p>
                      <div className="gmv-row-actions">
                        <button className="gmv-btn-edit" onClick={() => startEdit(entry)}>
                          {t("getMissionVision.edit")}
                        </button>
                        <button className="gmv-btn-delete" onClick={() => handleDelete(entry.id)}>
                          {t("getMissionVision.delete")}
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

export default GetMissionVision;