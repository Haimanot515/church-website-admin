import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetChurchPerson.css";

const CATEGORY_OPTIONS = [
  { value: "leader", labelKey: "categories.leader" },
  { value: "specialThanks", labelKey: "categories.specialThanks" },
  { value: "testimony", labelKey: "categories.testimony" },
];

const emptyForm = {
  name: "",
  description: "",
  role: "",
  category: "leader",
  files: [],
};

const GetChurchPerson = () => {
  const { t } = useTranslation("translation", { keyPrefix: "getChurchPerson" });
  const navigate = useNavigate();

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removingPhoto, setRemovingPhoto] = useState("");
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchPeople(categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  // Revoke preview URLs whenever they change or we unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const fetchPeople = async (category) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/church-persons", {
        params: category ? { category } : {},
      });

      setPeople(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (person) => {
    setEditingId(person._id);
    setFormError("");
    setForm({
      name: person.name || "",
      description: person.description || "",
      role: person.role || "",
      category: person.category || "leader",
      files: [],
    });
    setExistingPhotos(person.photos || []);
    setPreviews([]);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingPhotos([]);
    setPreviews([]);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, files: selectedFiles }));
    setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  // Existing photos are removed immediately via the dedicated PATCH endpoint,
  // separate from saving the rest of the form.
  const handleRemoveExistingPhoto = async (photoUrl) => {
    if (!editingId) return;

    const confirmed = window.confirm(t("removePhotoConfirm"));
    if (!confirmed) return;

    try {
      setRemovingPhoto(photoUrl);

      const res = await API.patch(`/church-persons/${editingId}/photo`, {
        photoUrl,
      });

      setExistingPhotos(res.data.photos || []);
      // Keep the underlying list in sync too
      setPeople((prev) =>
        prev.map((p) => (p._id === editingId ? { ...p, photos: res.data.photos } : p))
      );
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("removePhotoErrorMessage"));
    } finally {
      setRemovingPhoto("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("role", form.role);
      formData.append("category", form.category);

      // New photos are appended to the existing set (replacePhotos not sent)
      if (form.files.length > 0) {
        form.files.forEach((file) => formData.append("photos", file));
      }

      await API.put(`/church-persons/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("updateSuccessMessage"));
      handleCancelEdit();
      await fetchPeople(categoryFilter);
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("updateErrorMessage"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (person) => {
    const confirmed = window.confirm(t("deleteConfirm", { name: person.name }));
    if (!confirmed) return;

    try {
      setDeletingId(person._id);

      await API.delete(`/church-persons/${person._id}`);

      if (editingId === person._id) {
        handleCancelEdit();
      }

      await fetchPeople(categoryFilter);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("deleteErrorMessage"));
    } finally {
      setDeletingId(null);
    }
  };

  const categoryBadgeClass = (category) => {
    if (category === "leader") return "getChurchPerson-badge getChurchPerson-badge--leader";
    if (category === "specialThanks")
      return "getChurchPerson-badge getChurchPerson-badge--specialThanks";
    if (category === "testimony") return "getChurchPerson-badge getChurchPerson-badge--testimony";
    return "getChurchPerson-badge getChurchPerson-badge--default";
  };

  const categoryLabel = (category) => {
    const key = `categories.${category}`;
    const translated = t(key);
    return translated === key ? category : translated;
  };

  return (
    <div className="getChurchPerson-page">
      <div className="getChurchPerson-card">
        <div className="getChurchPerson-header">
          <h2 className="getChurchPerson-title">{t("title")}</h2>

          {!editingId && (
            <div className="getChurchPerson-toolbar">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="getChurchPerson-filterSelect"
              >
                <option value="">{t("allCategories")}</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>

              <button
                onClick={() => navigate("/admin/church-persons/create")}
                className="getChurchPerson-newButton"
              >
                {t("newPersonButton")}
              </button>
            </div>
          )}
        </div>

        {error && <p className="getChurchPerson-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="getChurchPerson-editPanel">
            <h3 className="getChurchPerson-editTitle">{t("editTitle")}</h3>

            {formError && <p className="getChurchPerson-error">{formError}</p>}

            <form onSubmit={handleSubmit} className="getChurchPerson-form">
              <label className="getChurchPerson-label" htmlFor="gcp-name">
                {t("nameLabel")}
                <span className="getChurchPerson-required"> *</span>
              </label>
              <input
                id="gcp-name"
                type="text"
                name="name"
                placeholder={t("namePlaceholder")}
                value={form.name}
                onChange={handleChange}
                required
                className="getChurchPerson-input"
              />

              <label className="getChurchPerson-label" htmlFor="gcp-category">
                {t("categoryLabel")}
                <span className="getChurchPerson-required"> *</span>
              </label>
              <select
                id="gcp-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="getChurchPerson-select"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>

              <label className="getChurchPerson-label" htmlFor="gcp-role">
                {t("roleLabel")}
                <span className="getChurchPerson-optional"> ({t("optional")})</span>
              </label>
              <input
                id="gcp-role"
                type="text"
                name="role"
                placeholder={t("rolePlaceholder")}
                value={form.role}
                onChange={handleChange}
                className="getChurchPerson-input"
              />

              <label className="getChurchPerson-label" htmlFor="gcp-description">
                {t("descriptionLabel")}
                <span className="getChurchPerson-optional"> ({t("optional")})</span>
              </label>
              <textarea
                id="gcp-description"
                name="description"
                placeholder={t("descriptionPlaceholder")}
                rows="4"
                value={form.description}
                onChange={handleChange}
                className="getChurchPerson-textarea"
              />

              {existingPhotos.length > 0 && (
                <div>
                  <p className="getChurchPerson-hint">{t("currentPhotosHint")}</p>
                  <div className="getChurchPerson-photoGrid">
                    {existingPhotos.map((url) => (
                      <div key={url} className="getChurchPerson-photoItem">
                        <img
                          src={url}
                          alt={t("existingPhotoAlt")}
                          className="getChurchPerson-photo"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingPhoto(url)}
                          disabled={removingPhoto === url}
                          className="getChurchPerson-removeButton"
                        >
                          {removingPhoto === url ? t("removingButton") : t("removeButton")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="getChurchPerson-fileLabel" htmlFor="gcp-photos">
                {t("addPhotosHint")}
                <span className="getChurchPerson-optional"> ({t("optional")})</span>
                <input
                  id="gcp-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="getChurchPerson-fileInput"
                />
              </label>

              {previews.length > 0 && (
                <div className="getChurchPerson-photoGrid">
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={t("previewAlt", { index: i })}
                      className="getChurchPerson-photo"
                    />
                  ))}
                </div>
              )}

              <div className="getChurchPerson-formActions">
                <button
                  type="submit"
                  disabled={submitting}
                  className="getChurchPerson-saveButton"
                >
                  {submitting ? t("savingButton") : t("saveButton")}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="getChurchPerson-cancelButton"
                >
                  {t("cancelButton")}
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId &&
          (loading ? (
            <div className="getChurchPerson-spinnerWrap">
              <div
                className="getChurchPerson-spinner"
                role="status"
                aria-label={t("loadingMessage")}
              />
            </div>
          ) : people.length === 0 ? (
            <p className="getChurchPerson-empty">{t("noResultsMessage")}</p>
          ) : (
            <div className="getChurchPerson-tableWrap">
              <table className="getChurchPerson-table">
                <thead>
                  <tr>
                    <th className="getChurchPerson-th">{t("tableHeaders.photo")}</th>
                    <th className="getChurchPerson-th">{t("tableHeaders.name")}</th>
                    <th className="getChurchPerson-th">{t("tableHeaders.category")}</th>
                    <th className="getChurchPerson-th">{t("tableHeaders.roleTitle")}</th>
                    <th className="getChurchPerson-th">{t("tableHeaders.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person._id}>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.photo")}>
                        {person.photos && person.photos.length > 0 ? (
                          <img
                            src={person.photos[0]}
                            alt={person.name}
                            className="getChurchPerson-avatar"
                          />
                        ) : (
                          <span className="getChurchPerson-noPhoto">&mdash;</span>
                        )}
                      </td>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.name")}>
                        {person.name}
                      </td>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.category")}>
                        <span className={categoryBadgeClass(person.category)}>
                          {categoryLabel(person.category)}
                        </span>
                      </td>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.roleTitle")}>
                        {person.role || "\u2014"}
                      </td>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.actions")}>
                        <div className="getChurchPerson-rowActions">
                          <button
                            onClick={() => handleEditClick(person)}
                            className="getChurchPerson-editRowButton"
                          >
                            {t("editButton")}
                          </button>

                          <button
                            onClick={() => handleDelete(person)}
                            disabled={deletingId === person._id}
                            className="getChurchPerson-deleteRowButton"
                          >
                            {deletingId === person._id ? t("deletingButton") : t("deleteButton")}
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

export default GetChurchPerson;