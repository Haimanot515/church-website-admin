import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./GetChurchStory.css";
import "../shared/AdminShared.css";
import ActionMenu from "../../components/ActionMenu";
import InfiniteScrollSentinel from "../../components/InfiniteScrollSentinel";

// Strips HTML tags for plain-text display/validation
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const emptyForm = {
  title: "",
  desc: "",
  leader: "",
  leaderRole: "",
  range: "",
  servedBy: "",
  file: null,
};

const GetChurchStories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  // append=true adds the next page under the current rows (infinite scroll)
  const fetchStories = async (pageToLoad, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);

      // Matches GET /api/church-story?page=&limit= -> getChurchStories
      const res = await API.get(`/church-story?page=${pageToLoad}&limit=10`);

      setStories((prev) => {
        if (!append) return res.data.stories;
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...res.data.stories.filter((x) => !seen.has(x.id))];
      });
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || t("getChurchStories.errorLoad"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload every page currently shown (after edit / delete)
  const refreshStories = async () => {
    try {
      let all = [];
      let total = 1;
      for (let pg = 1; pg <= page; pg++) {
        const res = await API.get(`/church-story?page=${pg}&limit=10`);
        all = all.concat(res.data.stories);
        total = res.data.totalPages;
      }
      setStories(all);
      setTotalPages(total);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getChurchStories.errorLoad"));
    }
  };

  const loadMoreStories = () => {
    if (loading || loadingMore || page >= totalPages) return;
    fetchStories(page + 1, true);
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
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    setEditingId(s.id);
    setFormError("");
    setForm({
      title: s.title || "",
      desc: s.desc || "",
      leader: s.leader || "",
      leaderRole: s.leaderRole || "",
      range: s.range || "",
      servedBy: s.servedBy || "",
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

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(form.title)) {
      setFormError(t("getChurchStories.errorTitleRequired"));
      return;
    }
    if (!stripHtml(form.desc)) {
      setFormError(t("getChurchStories.errorDescRequired"));
      return;
    }

    // The backend derives `year` and `order` from `range`, and requires
    // a 4-digit year inside it (e.g. "1998 - 2006"). Catch that early
    // instead of waiting for the schema validator to reject it.
    if (!/\d{4}/.test(form.range)) {
      setFormError(t("getChurchStories.errorRangeYearRequired"));
      return;
    }

    if (!stripHtml(form.range)) {
      setFormError("Range is required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("desc", form.desc);
      formData.append("leader", form.leader);
      formData.append("leaderRole", form.leaderRole);
      formData.append("range", form.range);
      formData.append("servedBy", form.servedBy);

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
      await refreshStories();
    } catch (err) {
      console.log(err);

      setFormError(err.response?.data?.message || t("getChurchStories.errorUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(t("getChurchStories.confirmDelete", { title: stripHtml(title) }));

    if (!confirmed) return;

    try {
      setDeletingId(id);

      // Auth header is attached globally by the API interceptor
      await API.delete(`/church-story/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
      setStories((prev) => prev.filter((s) => s.id !== id));
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
          <div ref={editPanelRef} className="gcsEditPanel rte-page-shell">
            <RichTextProvider>
            <div className="rte-editor-shell">
              <RichTextToolbar />
              <RichTextContextMenu />
              <div className="rte-scroll-area">
                <h3 className="gcsEditHeading">{t("getChurchStories.editHeading")}</h3>

                {formError && <p className="gcsError">{formError}</p>}

                <form onSubmit={handleSubmit} className="gcsForm">
                  <label className="gcsLabel" htmlFor="gcs-title">
                    {t("getChurchStories.titleLabel")}
                    <span className="gcsRequired"> *</span>
                  </label>
                  <RichTextField
                    id="gcs-title"
                    value={form.title}
                    onChange={(html) => setForm((prev) => ({ ...prev, title: html }))}
                    placeholder={t("getChurchStories.titlePlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                    autoFocus
                  />

                  <label className="gcsLabel" htmlFor="gcs-range">
                    {t("getChurchStories.rangeLabel")}
                    <span className="gcsRequired"> *</span>
                  </label>
                  <RichTextField
                    id="gcs-range"
                    value={form.range}
                    onChange={(html) => setForm((prev) => ({ ...prev, range: html }))}
                    placeholder={t("getChurchStories.rangePlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                  />

                  <label className="gcsLabel" htmlFor="gcs-desc">
                    {t("getChurchStories.descLabel")}
                    <span className="gcsRequired"> *</span>
                  </label>
                  <RichTextField
                    id="gcs-desc"
                    value={form.desc}
                    onChange={(html) => setForm((prev) => ({ ...prev, desc: html }))}
                    placeholder={t("getChurchStories.descPlaceholder")}
                    minHeight="160px"
                  />

                  <div className="gcsFieldRow">
                    <div className="gcsFieldCol">
                      <label className="gcsLabel" htmlFor="gcs-leader">
                        {t("getChurchStories.leaderLabel")}
                        <span className="gcsOptional"> ({t("getChurchStories.optional")})</span>
                      </label>
                      <RichTextField
                        id="gcs-leader"
                        value={form.leader}
                        onChange={(html) => setForm((prev) => ({ ...prev, leader: html }))}
                        placeholder={t("getChurchStories.leaderPlaceholder")}
                        minHeight="44px"
                        toolbar="minimal"
                      />
                    </div>

                    <div className="gcsFieldCol">
                      <label className="gcsLabel" htmlFor="gcs-leaderRole">
                        {t("getChurchStories.leaderRoleLabel")}
                        <span className="gcsOptional"> ({t("getChurchStories.optional")})</span>
                      </label>
                      <RichTextField
                        id="gcs-leaderRole"
                        value={form.leaderRole}
                        onChange={(html) => setForm((prev) => ({ ...prev, leaderRole: html }))}
                        placeholder={t("getChurchStories.leaderRolePlaceholder")}
                        minHeight="44px"
                        toolbar="minimal"
                      />
                    </div>
                  </div>

                  <label className="gcsLabel" htmlFor="gcs-servedBy">
                    {t("getChurchStories.servedByLabel")}
                    <span className="gcsOptional"> ({t("getChurchStories.optional")})</span>
                  </label>
                  <RichTextField
                    id="gcs-servedBy"
                    value={form.servedBy}
                    onChange={(html) => setForm((prev) => ({ ...prev, servedBy: html }))}
                    placeholder={t("getChurchStories.servedByPlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                  />

                  <label className="gcsLabel" htmlFor="gcs-file">
                    {t("getChurchStories.photoLabel")}
                    <span className="gcsOptional"> ({t("getChurchStories.optional")})</span>
                  </label>

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

                  <input id="gcs-file" type="file" accept="image/*" onChange={handleFileChange} />

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
            </div>
            </RichTextProvider>
          </div>
        )}

        {!editingId && (
          <>
            {loading ? (
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
                    borderTopColor: "#1a2b4c",
                    borderRadius: "50%",
                    animation: "gcsSpin 0.8s linear infinite",
                  }}
                />
                <style>{`
                  @keyframes gcsSpin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : (
              <>
                {stories.length === 0 && !error && (
                  <p className="gcsStatusText">{t("getChurchStories.empty")}</p>
                )}

                <div className="gcsList">
                  {stories.map((s) => (
                    <div key={s.id} className="gcsListItem">
                      <div className="gcsItemMain">
                        {s.photo && (
                          <img src={s.photo} alt={stripHtml(s.title)} className="gcsItemPhoto" />
                        )}

                        <div className="gcsItemText">
                          <strong className="gcsItemTitle">{stripHtml(s.title)}</strong>
                          <span className="gcsItemMeta">
                            {t("getChurchStories.orderLabel", { order: s.order })}
                            {s.year !== undefined && s.year !== null && s.year !== ""
                              ? ` · ${t("getChurchStories.yearLabel", { year: s.year })}`
                              : ""}
                          </span>

                          <div className="gcsItemSubline">
                            {s.leader && (
                              <>
                                {stripHtml(s.leader)}
                                {s.leaderRole ? ` — ${stripHtml(s.leaderRole)}` : ""}
                                {s.range ? ` (${stripHtml(s.range)})` : ""}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="gcsItemActions">
                        <ActionMenu
                          items={[
                            {
                              label: t("getChurchStories.editButton"),
                              onClick: () => handleEditClick(s),
                              tone: "edit",
                            },
                            {
                              label: deletingId === s.id ? t("getChurchStories.deleting") : t("getChurchStories.deleteButton"),
                              onClick: () => handleDelete(s.id, s.title),
                              tone: "delete",
                              disabled: deletingId === s.id,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <InfiniteScrollSentinel
                  hasMore={page < totalPages}
                  loading={loadingMore}
                  onLoadMore={loadMoreStories}
                  text={t("getChurchStories.loadingMore", "Loading more...")}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GetChurchStories;