import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetMedia.css";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "../shared/AdminShared.css";

// Title/description are stored as RichTextField HTML — strip tags for plain-text display
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const emptyForm = {
  title: "",
  description: "",
  type: "photo",
  status: "draft",
  category: "",
  file: null,
};

const getAcceptForType = (type) => {
  if (type === "photo") return "image/*";
  if (type === "video") return "video/*";
  if (type === "audio") return "audio/*";
  if (type === "document") return "application/pdf";
  return "*/*";
};

const typeBadgeClass = (type) => {
  if (type === "photo") return "gm-type-badge gm-type-photo";
  if (type === "video") return "gm-type-badge gm-type-video";
  if (type === "audio") return "gm-type-badge gm-type-audio";
  if (type === "document") return "gm-type-badge gm-type-document";
  return "gm-type-badge gm-type-default";
};

const GetMedia = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const catRes = await API.get("/categories");
        setCategories(catRes.data);
      } catch (err) {
        console.log(err);
        setError((prev) => prev || t("getMedia.errors.loadCategories"));
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke the object URL whenever the preview changes or we unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");

      // Backend returns a plain array — no pagination on this endpoint yet
      const res = await API.get("/media");

      setMedia(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getMedia.errors.loadMedia"));
    } finally {
      setLoading(false);
    }
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormError("");
    setForm({
      title: item.title || "",
      description: item.description || "",
      type: item.mediaType || "photo",
      status: item.status || "draft",
      category: item.category?.id || "",
      file: null,
    });
    setExistingUrl(item.mediaUrl || "");
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setExistingUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    // title is now a RichTextField (contenteditable), not a native input,
    // so `required` can't validate it — check the plain text instead.
    if (!stripHtml(form.title)) {
      setFormError(t("getMedia.errors.titleRequired"));
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("status", form.status);
      formData.append("category", form.category);

      if (form.file) {
        formData.append("file", form.file);
      }

      await API.put(`/media/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("getMedia.updateSuccess"));
      handleCancelEdit();
      await fetchMedia();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("getMedia.errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (item) => {
    const confirmed = window.confirm(t("getMedia.confirmDelete", { title: stripHtml(item.title) }));
    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      await API.delete(`/media/${item.id}`);

      if (editingId === item.id) {
        handleCancelEdit();
      }

      await fetchMedia();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getMedia.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  const renderThumb = (item) => {
    if (item.mediaType === "photo" && item.mediaUrl) {
      return <img src={item.mediaUrl} alt={stripHtml(item.title)} className="gm-thumb" />;
    }

    if (item.thumbnail) {
      return <img src={item.thumbnail} alt={stripHtml(item.title)} className="gm-thumb" />;
    }

    if (item.mediaUrl) {
      return (
        <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="gm-link">
          {t("getMedia.viewFile")}
        </a>
      );
    }

    return <span className="gm-thumb-empty">—</span>;
  };

  return (
    <div className="gm-page">
      <div className="gm-card">
        <div className="gm-header">
          <h2>{t("getMedia.heading")}</h2>

          {!editingId && (
            <button className="gm-btn-new" onClick={() => navigate("/admin/media/create")}>
              {t("getMedia.newMedia")}
            </button>
          )}
        </div>

        {error && <p className="gm-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="gm-edit-panel rte-page-shell">
            <RichTextProvider>
            <div className="rte-editor-shell">
              <RichTextToolbar />
              <RichTextContextMenu />
              <div className="rte-scroll-area">
                <h3>{t("getMedia.editHeading")}</h3>

                {formError && <p className="gm-error">{formError}</p>}

                <form onSubmit={handleSubmit} className="gm-form">
                  <RichTextField
                    value={form.title}
                    onChange={(html) => setForm((prev) => ({ ...prev, title: html }))}
                    placeholder={t("getMedia.form.titlePlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                    autoFocus
                  />

                  <RichTextField
                    value={form.description}
                    onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                    placeholder={t("getMedia.form.descriptionPlaceholder")}
                    minHeight="120px"
                  />

                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="photo">{t("getMedia.form.typePhoto")}</option>
                    <option value="video">{t("getMedia.form.typeVideo")}</option>
                    <option value="audio">{t("getMedia.form.typeAudio")}</option>
                    <option value="document">{t("getMedia.form.typeDocument")}</option>
                  </select>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={optionsLoading}
                  >
                    <option value="">
                      {optionsLoading ? t("getMedia.form.loadingCategories") : t("getMedia.form.selectCategory")}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="draft">{t("getMedia.form.saveDraft")}</option>
                    <option value="published">{t("getMedia.form.publish")}</option>
                  </select>

                  <input type="file" accept={getAcceptForType(form.type)} onChange={handleFileChange} />
                  <p className="gm-hint">{t("getMedia.form.keepFileHint")}</p>

                  {preview && form.type === "photo" && (
                    <img src={preview} alt="preview" className="gm-file-preview" />
                  )}
                  {preview && form.type === "video" && (
                    <video src={preview} controls className="gm-video-preview" />
                  )}
                  {preview && form.type === "audio" && <audio src={preview} controls />}
                  {preview && form.type === "document" && (
                    <div className="gm-pdf-frame-wrap">
                      <iframe src={preview} title="PDF preview" className="gm-pdf-frame" />
                    </div>
                  )}

                  {!preview && existingUrl && form.type === "photo" && (
                    <img src={existingUrl} alt="current" className="gm-file-preview" />
                  )}
                  {!preview &&
                    existingUrl &&
                    (form.type === "video" || form.type === "audio" || form.type === "document") && (
                      <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="gm-link">
                        {t("getMedia.form.viewCurrentFile")}
                      </a>
                    )}

                  <div className="gm-form-actions">
                    <button type="submit" disabled={submitting || optionsLoading} className="gm-btn-primary">
                      {submitting ? t("getMedia.form.saving") : t("getMedia.form.saveChanges")}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="gm-btn-cancel"
                    >
                      {t("getMedia.form.cancel")}
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
            <p>{t("getMedia.loadingMedia")}</p>
          ) : media.length === 0 ? (
            <p>{t("getMedia.noMedia")}</p>
          ) : (
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>{t("getMedia.table.file")}</th>
                    <th>{t("getMedia.table.title")}</th>
                    <th>{t("getMedia.table.type")}</th>
                    <th>{t("getMedia.table.category")}</th>
                    <th>{t("getMedia.table.status")}</th>
                    <th>{t("getMedia.table.created")}</th>
                    <th>{t("getMedia.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map((item) => (
                    <tr key={item.id}>
                      <td data-label={t("getMedia.table.file")}>{renderThumb(item)}</td>
                      <td data-label={t("getMedia.table.title")}>{stripHtml(item.title) || "—"}</td>
                      <td data-label={t("getMedia.table.type")}>
                        <span className={typeBadgeClass(item.mediaType)}>{item.mediaType}</span>
                      </td>
                      <td data-label={t("getMedia.table.category")}>{item.category?.name || "—"}</td>
                      <td data-label={t("getMedia.table.status")}>
                        <span
                          className={`gm-status-badge ${
                            item.status === "published" ? "gm-status-published" : "gm-status-draft"
                          }`}
                        >
                          {item.status === "published"
                            ? t("getMedia.status.published")
                            : t("getMedia.status.draft")}
                        </span>
                      </td>
                      <td data-label={t("getMedia.table.created")}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td data-label={t("getMedia.table.actions")}>
                        <div className="gm-row-actions">
                          <button className="gm-btn-edit" onClick={() => handleEditClick(item)}>
                            {t("getMedia.actions.edit")}
                          </button>

                          <button
                            className="gm-btn-delete"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id
                              ? t("getMedia.actions.deleting")
                              : t("getMedia.actions.delete")}
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

export default GetMedia;