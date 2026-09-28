import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./GetChurch.css";
import "../shared/AdminShared.css";
import ActionMenu from "../../components/ActionMenu";

// Strips HTML tags for plain-text display/validation
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const emptyEditForm = {
  churchName: "",
  description: "",
  address: "",
  serviceDays: "",
  serviceTime: "",
  isFeatured: false,
  isPrimary: false,
  image: null,
};

const GetChurch = () => {
  const { t } = useTranslation("translation", { keyPrefix: "getChurch" });

  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Inline edit state — which row is being edited, its draft fields, and
  // its (read-only) language, since editing no longer navigates away.
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editLanguage, setEditLanguage] = useState(null);
  const [editExistingImage, setEditExistingImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const fetchChurches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/churches");
      setChurches(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  const handleDelete = async (id, churchName) => {
    const confirmed = window.confirm(t("deleteConfirm", { churchName: stripHtml(churchName) }));
    if (!confirmed) return;

    try {
      setDeletingId(id);

      // Auth header is attached by the API interceptor
      await API.delete(`/churches/${id}`);

      // Remove locally instead of refetching everything
      // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
      setChurches((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || t("deleteErrorMessage"));
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (c) => {
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    setEditingId(c.id);
    setEditForm({
      churchName: c.churchName || "",
      description: c.description || "",
      address: c.address || "",
      serviceDays: c.serviceDays || "",
      serviceTime: c.serviceTime || "",
      isFeatured: !!c.isFeatured,
      isPrimary: !!c.isPrimary,
      image: null,
    });
    setEditLanguage(c.language || null);
    setEditExistingImage(c.image || null);
    setEditPreview(null);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEditForm);
    setEditLanguage(null);
    setEditExistingImage(null);
    setEditPreview(null);
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSave = async (id) => {
    setEditError("");

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(editForm.churchName)) {
      setEditError(t("churchNameRequiredError"));
      return;
    }
    if (!stripHtml(editForm.description)) {
      setEditError(t("descriptionRequiredError"));
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("churchName", editForm.churchName);
      formData.append("description", editForm.description);
      formData.append("address", editForm.address);
      formData.append("serviceDays", editForm.serviceDays);
      formData.append("serviceTime", editForm.serviceTime);
      formData.append("isFeatured", String(editForm.isFeatured));
      formData.append("isPrimary", String(editForm.isPrimary));
      // Send the existing language id back so the Prisma update never
      // loses/overwrites the relation.
      const langId = editLanguage?.id ?? editLanguage;
      if (langId) formData.append("language", langId);

      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      // Auth header is already attached globally by the API interceptor.
      // Matches PUT /api/churches/:id in churchRoutes.js
      await API.put(`/churches/${id}`, formData);

      // Refetch so the row has the same shape as the list endpoint returns
      await fetchChurches();

      cancelEdit();
    } catch (err) {
      console.log(err);
      setEditError(err.response?.data?.message || t("editErrorMessage"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="getChurch-page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "4px solid rgba(0, 0, 0, 0.1)",
              borderTopColor: "#0b142c",
              borderRadius: "50%",
              animation: "getChurchSpin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes getChurchSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="getChurch-page">
      <div className="getChurch-card">
        <div className="getChurch-header">
          <h2 className="getChurch-title">{t("title")}</h2>
          <button
            onClick={() => navigate("/admin/churches/create")}
            className="getChurch-newButton"
          >
            {t("newChurchButton")}
          </button>
        </div>

        {error && <p className="getChurch-error">{error}</p>}

        {churches.length === 0 && !error && (
          <p className="getChurch-empty">{t("noChurchesMessage")}</p>
        )}

        {editingId && (
          <p className="getChurch-editingNotice">{t("editingNotice")}</p>
        )}

        <div className="getChurch-list">
          {churches
            .filter((c) => !editingId || c.id === editingId)
            .map((c) => {
            const isEditing = editingId === c.id;

            if (isEditing) {
              return (
                <div key={c.id} className="getChurch-row getChurch-row--editing rte-page-shell">
                  <RichTextProvider>
                  <div className="rte-editor-shell">
                    <RichTextToolbar />
                    <RichTextContextMenu />
                    <div className="rte-scroll-area">
                      {editError && <p className="getChurch-error">{editError}</p>}

                      <label className="getChurch-label">{t("languageLabel")}</label>
                      <div className="getChurch-readonly">
                        {editLanguage?.name
                          ? `${editLanguage.name}${editLanguage.code ? ` (${editLanguage.code})` : ""}`
                          : t("languageUnknown")}
                      </div>

                      <label className="getChurch-label" htmlFor={`ec-name-${c.id}`}>
                        {t("churchNameLabel")}
                        <span className="getChurch-required"> *</span>
                      </label>
                      <RichTextField
                        id={`ec-name-${c.id}`}
                        value={editForm.churchName}
                        onChange={(html) => setEditForm((prev) => ({ ...prev, churchName: html }))}
                        minHeight="44px"
                        toolbar="minimal"
                        autoFocus
                      />

                      <label className="getChurch-label" htmlFor={`ec-desc-${c.id}`}>
                        {t("descriptionLabel")}
                        <span className="getChurch-required"> *</span>
                      </label>
                      <RichTextField
                        id={`ec-desc-${c.id}`}
                        value={editForm.description}
                        onChange={(html) => setEditForm((prev) => ({ ...prev, description: html }))}
                        minHeight="160px"
                      />

                      <label className="getChurch-label" htmlFor={`ec-address-${c.id}`}>
                        {t("addressLabel")}
                        <span className="getChurch-optional"> ({t("optional")})</span>
                      </label>
                      <RichTextField
                        id={`ec-address-${c.id}`}
                        value={editForm.address}
                        onChange={(html) => setEditForm((prev) => ({ ...prev, address: html }))}
                        minHeight="44px"
                        toolbar="minimal"
                      />

                      <div className="getChurch-row2col">
                        <div className="getChurch-col">
                          <label className="getChurch-label" htmlFor={`ec-days-${c.id}`}>
                            {t("serviceDaysLabel")}
                            <span className="getChurch-optional"> ({t("optional")})</span>
                          </label>
                          <RichTextField
                            id={`ec-days-${c.id}`}
                            value={editForm.serviceDays}
                            onChange={(html) => setEditForm((prev) => ({ ...prev, serviceDays: html }))}
                            minHeight="44px"
                            toolbar="minimal"
                          />
                        </div>

                        <div className="getChurch-col">
                          <label className="getChurch-label" htmlFor={`ec-time-${c.id}`}>
                            {t("serviceTimeLabel")}
                            <span className="getChurch-optional"> ({t("optional")})</span>
                          </label>
                          <RichTextField
                            id={`ec-time-${c.id}`}
                            value={editForm.serviceTime}
                            onChange={(html) => setEditForm((prev) => ({ ...prev, serviceTime: html }))}
                            minHeight="44px"
                            toolbar="minimal"
                          />
                        </div>
                      </div>

                      <label className="getChurch-fileLabel" htmlFor={`ec-image-${c.id}`}>
                        {t("uploadImageLabel")}
                        <span className="getChurch-optional"> ({t("optional")})</span>
                        <input
                          id={`ec-image-${c.id}`}
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileChange}
                          className="getChurch-fileInput"
                        />
                      </label>

                      {(editPreview || editExistingImage) && (
                        <img
                          src={editPreview || editExistingImage}
                          alt={t("imageAlt")}
                          className="getChurch-preview"
                        />
                      )}

                      <label className="getChurch-checkboxLabel">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={editForm.isFeatured}
                          onChange={handleEditChange}
                          className="getChurch-checkbox"
                        />
                        {t("featured")}
                      </label>

                      <label className="getChurch-checkboxLabel">
                        <input
                          type="checkbox"
                          name="isPrimary"
                          checked={editForm.isPrimary}
                          onChange={handleEditChange}
                          className="getChurch-checkbox"
                        />
                        <span>
                          {t("setAsMainChurch")}
                          <small className="getChurch-hint">{t("mainChurchHint")}</small>
                        </span>
                      </label>

                      <div className="getChurch-editActions">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="getChurch-cancelButton"
                        >
                          {t("cancelButton")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditSave(c.id)}
                          disabled={saving}
                          className="getChurch-submitButton"
                        >
                          {saving ? t("savingButton") : t("saveButton")}
                        </button>
                      </div>
                    </div>
                  </div>
                  </RichTextProvider>
                </div>
              );
            }

            return (
              <div key={c.id} className="getChurch-row">
                <div className="getChurch-info">
                  {c.image && (
                    <img src={c.image} alt={stripHtml(c.churchName)} className="getChurch-thumb" />
                  )}
                  <div className="getChurch-details">
                    <div className="getChurch-nameRow">
                      <strong className="getChurch-name">{stripHtml(c.churchName)}</strong>
                      {c.isPrimary && (
                        <span className="getChurch-badge getChurch-badge--main">
                          {t("mainChurchBadge")}
                        </span>
                      )}
                      {c.isFeatured && (
                        <span className="getChurch-badge getChurch-badge--featured">
                          {t("featuredBadge")}
                        </span>
                      )}
                    </div>

                    {c.description && (
                      <p className="getChurch-description">{stripHtml(c.description)}</p>
                    )}

                    <div className="getChurch-meta">
                      {c.language?.name && (
                        <span className="getChurch-metaItem">
                          {t("languageLabel")}: {c.language.name}
                          {c.language.code ? ` (${c.language.code})` : ""}
                        </span>
                      )}
                      {c.address && (
                        <span className="getChurch-metaItem">{stripHtml(c.address)}</span>
                      )}
                      {c.serviceDays && (
                        <span className="getChurch-metaItem">
                          {t("serviceDaysLabel")}: {stripHtml(c.serviceDays)}
                        </span>
                      )}
                      {c.serviceTime && (
                        <span className="getChurch-metaItem">
                          {t("serviceTimeLabel")}: {stripHtml(c.serviceTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="getChurch-actions">
                  <ActionMenu
                    items={[
                      {
                        label: t("editButton"),
                        onClick: () => startEdit(c),
                        tone: "edit",
                      },
                      {
                        label: deletingId === c.id ? t("deletingButton") : t("deleteButton"),
                        onClick: () => handleDelete(c.id, c.churchName),
                        tone: "delete",
                        disabled: deletingId === c.id,
                      },
                    ]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GetChurch;