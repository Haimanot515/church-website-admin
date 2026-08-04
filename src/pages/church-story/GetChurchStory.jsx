import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetChurchStory.css";

const emptyForm = {
  title: "",
  desc: "",
  leader: "",
  leaderRole: "",
  range: "",
  servedBy: "",
  order: 0,
  year: "",
  file: null,
};

const GetChurchStories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  const fetchStories = async (pageToLoad) => {
    try {
      setLoading(true);

      // Matches GET /api/church-story?page=&limit= -> getChurchStories
      const res = await API.get(`/church-story?page=${pageToLoad}&limit=10`);

      setStories(res.data.stories);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || t("getChurchStories.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke the preview URL whenever it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (s) => {
    setEditingId(s._id);
    setFormError("");
    setForm({
      title: s.title || "",
      desc: s.desc || "",
      leader: s.leader || "",
      leaderRole: s.leaderRole || "",
      range: s.range || "",
      servedBy: s.servedBy || "",
      order: s.order ?? 0,
      year: s.year ?? "",
      file: null,
    });
    setExistingPhoto(s.photo || null);
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingPhoto(null);
    setPreview(null);
    setFormError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setForm({ ...form, file: selectedFile || null });

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("desc", form.desc);
      formData.append("leader", form.leader);
      formData.append("leaderRole", form.leaderRole);
      formData.append("range", form.range);
      formData.append("servedBy", form.servedBy);
      formData.append("order", form.order);

      // Only append year if a value was actually entered — sending an
      // empty string can fail schema validation if year is typed as a
      // Number.
      if (form.year) {
        formData.append("year", form.year);
      }

      if (form.file) {
        formData.append("photo", form.file);
      }

      // Auth header is already attached globally by the API interceptor
      // Matches PUT /api/church-story/:id -> updateChurchStory
      await API.put(`/church-story/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("getChurchStories.successUpdate"));
      handleCancelEdit();
      await fetchStories(page);
    } catch (err) {
      console.log(err);

      setFormError(err.response?.data?.message || t("getChurchStories.errorUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(t("getChurchStories.confirmDelete", { title }));

    if (!confirmed) return;

    try {
      setDeletingId(id);

      // Auth header is attached globally by the API interceptor
      await API.delete(`/church-story/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || t("getChurchStories.errorDelete"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="gcsPage">
      <div className="gcsCard">
        <div className="gcsTopBar">
          <h2 className="gcsHeading">{t("getChurchStories.heading")}</h2>

          {!editingId && (
            <button
              onClick={() => navigate("/admin/church-story/create")}
              className="gcsNewButton"
            >
              {t("getChurchStories.newChapterButton")}
            </button>
          )}
        </div>

        {error && <p className="gcsError">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="gcsEditPanel">
            <h3 className="gcsEditHeading">{t("getChurchStories.editHeading")}</h3>

            {formError && <p className="gcsError">{formError}</p>}

            <form onSubmit={handleSubmit} className="gcsForm">
              <input
                type="text"
                name="title"
                placeholder={t("getChurchStories.titlePlaceholder")}
                value={form.title}
                onChange={handleChange}
                required
                className="gcsInput"
              />

              <div className="gcsFieldRow">
                <input
                  type="text"
                  name="leader"
                  placeholder={t("getChurchStories.leaderPlaceholder")}
                  value={form.leader}
                  onChange={handleChange}
                  className="gcsInput"
                />

                <input
                  type="text"
                  name="leaderRole"
                  placeholder={t("getChurchStories.leaderRolePlaceholder")}
                  value={form.leaderRole}
                  onChange={handleChange}
                  className="gcsInput"
                />
              </div>

              <div className="gcsFieldRow">
                <input
                  type="text"
                  name="range"
                  placeholder={t("getChurchStories.rangePlaceholder")}
                  value={form.range}
                  onChange={handleChange}
                  className="gcsInput"
                />

                <input
                  type="text"
                  name="servedBy"
                  placeholder={t("getChurchStories.servedByPlaceholder")}
                  value={form.servedBy}
                  onChange={handleChange}
                  className="gcsInput"
                />
              </div>

              <div className="gcsFieldRow">
                <input
                  type="number"
                  name="order"
                  placeholder={t("getChurchStories.orderPlaceholder")}
                  value={form.order}
                  onChange={handleChange}
                  min="0"
                  className="gcsInput"
                />

                <input
                  type="number"
                  name="year"
                  placeholder={t("getChurchStories.yearPlaceholder")}
                  value={form.year}
                  onChange={handleChange}
                  className="gcsInput"
                />
              </div>

              <textarea
                name="desc"
                placeholder={t("getChurchStories.descPlaceholder")}
                rows="5"
                value={form.desc}
                onChange={handleChange}
                className="gcsTextarea"
              />

              {existingPhoto && !preview && (
                <div className="gcsPhotoBlock">
                  <small className="gcsPhotoLabel">{t("getChurchStories.currentPhotoLabel")}</small>
                  <img
                    src={existingPhoto}
                    alt={t("getChurchStories.currentPhotoAlt")}
                    className="gcsPhotoPreview"
                  />
                </div>
              )}

              <input type="file" accept="image/*" onChange={handleFileChange} />

              {preview && (
                <div className="gcsPhotoBlock">
                  <small className="gcsPhotoLabel">{t("getChurchStories.newPhotoLabel")}</small>
                  <img src={preview} alt={t("getChurchStories.previewAlt")} className="gcsPhotoPreview" />
                </div>
              )}

              <div className="gcsFormActions">
                <button type="submit" disabled={submitting} className="gcsSaveButton">
                  {submitting ? t("getChurchStories.saving") : t("getChurchStories.saveButton")}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="gcsCancelButton"
                >
                  {t("getChurchStories.cancelButton")}
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId && (
          <>
            {loading ? (
              <p className="gcsStatusText">{t("getChurchStories.loading")}</p>
            ) : (
              <>
                {stories.length === 0 && !error && (
                  <p className="gcsStatusText">{t("getChurchStories.empty")}</p>
                )}

                <div className="gcsList">
                  {stories.map((s) => (
                    <div key={s._id} className="gcsListItem">
                      <div className="gcsItemMain">
                        {s.photo && (
                          <img src={s.photo} alt={s.title} className="gcsItemPhoto" />
                        )}

                        <div className="gcsItemText">
                          <strong className="gcsItemTitle">{s.title}</strong>
                          <span className="gcsItemMeta">
                            {t("getChurchStories.orderLabel", { order: s.order })}
                            {s.year !== undefined && s.year !== null && s.year !== ""
                              ? ` · ${t("getChurchStories.yearLabel", { year: s.year })}`
                              : ""}
                          </span>

                          <div className="gcsItemSubline">
                            {s.leader && (
                              <>
                                {s.leader}
                                {s.leaderRole ? ` — ${s.leaderRole}` : ""}
                                {s.range ? ` (${s.range})` : ""}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="gcsItemActions">
                        <button onClick={() => handleEditClick(s)} className="gcsEditButton">
                          {t("getChurchStories.editButton")}
                        </button>

                        <button
                          onClick={() => handleDelete(s._id, s.title)}
                          disabled={deletingId === s._id}
                          className="gcsDeleteButton"
                        >
                          {deletingId === s._id
                            ? t("getChurchStories.deleting")
                            : t("getChurchStories.deleteButton")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="gcsPagination">
                    <button
                      onClick={() => fetchStories(page - 1)}
                      disabled={page <= 1}
                      className="gcsPageButton"
                    >
                      {t("getChurchStories.previous")}
                    </button>

                    <span className="gcsPageLabel">
                      {t("getChurchStories.pageLabel", { page, totalPages })}
                    </span>

                    <button
                      onClick={() => fetchStories(page + 1)}
                      disabled={page >= totalPages}
                      className="gcsPageButton"
                    >
                      {t("getChurchStories.next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GetChurchStories;