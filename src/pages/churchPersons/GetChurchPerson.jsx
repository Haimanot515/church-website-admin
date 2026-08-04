import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetChurchPerson.css";

// Values sent to/read from the backend stay fixed English/enum strings;
// only the displayed label is translated via roles.<key> / ranks.<key>.
const ROLE_OPTIONS = [
  { value: "", labelKey: null },
  { value: "Founding Pastor", labelKey: "roles.foundingPastor" },
  { value: "Senior Pastor", labelKey: "roles.seniorPastor" },
  { value: "Associate Pastor", labelKey: "roles.associatePastor" },
  { value: "Church Elder", labelKey: "roles.churchElder" },
  { value: "Ministry Assistant", labelKey: "roles.ministryAssistant" },
  { value: "Worship Leader", labelKey: "roles.worshipLeader" },
  { value: "Small Group Leader", labelKey: "roles.smallGroupLeader" },
  { value: "Food Pantry Volunteer", labelKey: "roles.foodPantryVolunteer" },
  { value: "Worship Team Member", labelKey: "roles.worshipTeamMember" },
  { value: "Sunday School Teacher", labelKey: "roles.sundaySchoolTeacher" },
  { value: "Choir Member", labelKey: "roles.choirMember" },
  { value: "Usher", labelKey: "roles.usher" },
  { value: "Treasurer", labelKey: "roles.treasurer" },
  { value: "Secretary", labelKey: "roles.secretary" },
  { value: "Member", labelKey: "roles.member" },
];

const RANK_OPTIONS = [
  { value: "", labelKey: null },
  { value: "patriarch", labelKey: "ranks.patriarch" },
  { value: "archbishop", labelKey: "ranks.archbishop" },
  { value: "bishop", labelKey: "ranks.bishop" },
  { value: "archpriest", labelKey: "ranks.archpriest" },
  { value: "priest", labelKey: "ranks.priest" },
  { value: "deacon", labelKey: "ranks.deacon" },
  { value: "subdeacon", labelKey: "ranks.subdeacon" },
  { value: "elder", labelKey: "ranks.elder" },
  { value: "member", labelKey: "ranks.member" },
];

const CATEGORY_OPTIONS = [
  { value: "leader", labelKey: "categories.leader" },
  { value: "specialThanks", labelKey: "categories.specialThanks" },
  { value: "testimony", labelKey: "categories.testimony" },
];

const emptyForm = {
  name: "",
  title: "",
  description: "",
  role: "",
  message: "",
  category: "leader",
  rank: "",
  rankOrder: 0,
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
      title: person.title || "",
      description: person.description || "",
      role: person.role || "",
      message: person.message || "",
      category: person.category || "leader",
      rank: person.rank || "",
      rankOrder: person.rankOrder ?? 0,
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
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("role", form.role);
      formData.append("message", form.message);
      formData.append("category", form.category);

      if (form.rank) {
        formData.append("rank", form.rank);
      }

      formData.append("rankOrder", form.rankOrder);

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

  const rankLabel = (rank) => {
    if (!rank) return "\u2014";
    const key = `ranks.${rank}`;
    const translated = t(key);
    return translated === key ? rank : translated;
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
              <input
                type="text"
                name="name"
                placeholder={t("namePlaceholder")}
                value={form.name}
                onChange={handleChange}
                required
                className="getChurchPerson-input"
              />

              <select
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

              <input
                type="text"
                name="title"
                placeholder={t("titlePlaceholder")}
                value={form.title}
                onChange={handleChange}
                className="getChurchPerson-input"
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="getChurchPerson-select"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelKey ? t(opt.labelKey) : t("selectRole")}
                  </option>
                ))}
              </select>

              <select
                name="rank"
                value={form.rank}
                onChange={handleChange}
                className="getChurchPerson-select"
              >
                {RANK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelKey ? t(opt.labelKey) : t("noRank")}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="rankOrder"
                placeholder={t("rankOrderPlaceholder")}
                value={form.rankOrder}
                onChange={handleChange}
                min="0"
                className="getChurchPerson-input"
              />

              <textarea
                name="description"
                placeholder={t("descriptionPlaceholder")}
                rows="4"
                value={form.description}
                onChange={handleChange}
                className="getChurchPerson-textarea"
              />

              <textarea
                name="message"
                placeholder={t("messagePlaceholder")}
                rows="4"
                value={form.message}
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

              <div>
                <p className="getChurchPerson-hint">{t("addPhotosHint")}</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="getChurchPerson-fileInput"
                />
              </div>

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
            <p className="getChurchPerson-loading">{t("loadingMessage")}</p>
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
                    <th className="getChurchPerson-th">{t("tableHeaders.rank")}</th>
                    <th className="getChurchPerson-th">{t("tableHeaders.rankOrder")}</th>
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
                        {person.title || person.role || "\u2014"}
                      </td>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.rank")}>
                        {rankLabel(person.rank)}
                      </td>
                      <td className="getChurchPerson-td" data-label={t("tableHeaders.rankOrder")}>
                        {person.rankOrder}
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