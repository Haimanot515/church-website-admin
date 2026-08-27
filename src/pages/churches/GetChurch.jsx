import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetChurch.css";

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
    const confirmed = window.confirm(t("deleteConfirm", { churchName }));
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/churches/:id in churchRoutes.js
      await API.delete(`/churches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove locally instead of refetching everything
      setChurches((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || t("deleteErrorMessage"));
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
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

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("churchName", editForm.churchName);
      formData.append("description", editForm.description);
      formData.append("address", editForm.address);
      formData.append("serviceDays", editForm.serviceDays);
      formData.append("serviceTime", editForm.serviceTime);
      formData.append("isFeatured", editForm.isFeatured);
      formData.append("isPrimary", editForm.isPrimary);
      // language intentionally not sent — it's fixed at creation and the
      // update controller leaves it untouched when omitted.

      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      // Auth header is already attached globally by the API interceptor.
      // Matches PUT /api/churches/:id in churchRoutes.js
      const res = await API.put(`/churches/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data.church || res.data;

      // Patch it in place instead of refetching the whole list
      setChurches((prev) => prev.map((c) => (c._id === id ? updated : c)));

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
            .filter((c) => !editingId || c._id === editingId)
            .map((c) => {
            const isEditing = editingId === c._id;

            if (isEditing) {
              return (
                <div key={c._id} className="getChurch-row getChurch-row--editing">
                  {editError && <p className="getChurch-error">{editError}</p>}

                  <label className="getChurch-label">{t("languageLabel")}</label>
                  <div className="getChurch-readonly">
                    {editLanguage?.name
                      ? `${editLanguage.name}${editLanguage.code ? ` (${editLanguage.code})` : ""}`
                      : t("languageUnknown")}
                  </div>

                  <label className="getChurch-label" htmlFor={`ec-name-${c._id}`}>
                    {t("churchNameLabel")}
                    <span className="getChurch-required"> *</span>
                  </label>
                  <input
                    id={`ec-name-${c._id}`}
                    type="text"
                    name="churchName"
                    value={editForm.churchName}
                    onChange={handleEditChange}
                    required
                    className="getChurch-input"
                  />

                  <label className="getChurch-label" htmlFor={`ec-desc-${c._id}`}>
                    {t("descriptionLabel")}
                    <span className="getChurch-required"> *</span>
                  </label>
                  <textarea
                    id={`ec-desc-${c._id}`}
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="4"
                    required
                    className="getChurch-textarea"
                  />

                  <label className="getChurch-label" htmlFor={`ec-address-${c._id}`}>
                    {t("addressLabel")}
                    <span className="getChurch-optional"> ({t("optional")})</span>
                  </label>
                  <input
                    id={`ec-address-${c._id}`}
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="getChurch-input"
                  />

                  <div className="getChurch-row2col">
                    <div className="getChurch-col">
                      <label className="getChurch-label" htmlFor={`ec-days-${c._id}`}>
                        {t("serviceDaysLabel")}
                        <span className="getChurch-optional"> ({t("optional")})</span>
                      </label>
                      <input
                        id={`ec-days-${c._id}`}
                        type="text"
                        name="serviceDays"
                        value={editForm.serviceDays}
                        onChange={handleEditChange}
                        className="getChurch-input"
                      />
                    </div>

                    <div className="getChurch-col">
                      <label className="getChurch-label" htmlFor={`ec-time-${c._id}`}>
                        {t("serviceTimeLabel")}
                        <span className="getChurch-optional"> ({t("optional")})</span>
                      </label>
                      <input
                        id={`ec-time-${c._id}`}
                        type="text"
                        name="serviceTime"
                        value={editForm.serviceTime}
                        onChange={handleEditChange}
                        className="getChurch-input"
                      />
                    </div>
                  </div>

                  <label className="getChurch-fileLabel" htmlFor={`ec-image-${c._id}`}>
                    {t("uploadImageLabel")}
                    <span className="getChurch-optional"> ({t("optional")})</span>
                    <input
                      id={`ec-image-${c._id}`}
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
                      onClick={() => handleEditSave(c._id)}
                      disabled={saving}
                      className="getChurch-submitButton"
                    >
                      {saving ? t("savingButton") : t("saveButton")}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={c._id} className="getChurch-row">
                <div className="getChurch-info">
                  {c.image && (
                    <img src={c.image} alt={c.churchName} className="getChurch-thumb" />
                  )}
                  <div className="getChurch-details">
                    <div className="getChurch-nameRow">
                      <strong className="getChurch-name">{c.churchName}</strong>
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
                      <p className="getChurch-description">{c.description}</p>
                    )}

                    <div className="getChurch-meta">
                      {c.language?.name && (
                        <span className="getChurch-metaItem">
                          {t("languageLabel")}: {c.language.name}
                          {c.language.code ? ` (${c.language.code})` : ""}
                        </span>
                      )}
                      {c.address && (
                        <span className="getChurch-metaItem">{c.address}</span>
                      )}
                      {c.serviceDays && (
                        <span className="getChurch-metaItem">
                          {t("serviceDaysLabel")}: {c.serviceDays}
                        </span>
                      )}
                      {c.serviceTime && (
                        <span className="getChurch-metaItem">
                          {t("serviceTimeLabel")}: {c.serviceTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="getChurch-actions">
                  <button onClick={() => startEdit(c)} className="getChurch-editButton">
                    {t("editButton")}
                  </button>
                  <button
                    onClick={() => handleDelete(c._id, c.churchName)}
                    disabled={deletingId === c._id}
                    className="getChurch-deleteButton"
                  >
                    {deletingId === c._id ? t("deletingButton") : t("deleteButton")}
                  </button>
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