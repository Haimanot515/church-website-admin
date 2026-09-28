import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetHomeHero.css";
import "../shared/AdminShared.css";

import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import InfiniteScrollSentinel from "../../components/InfiniteScrollSentinel";

// Fields are stored as rich-text HTML — strip tags for plain-text checks and list display
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const HEROES_PER_PAGE = 10;

const emptyForm = {
  title: "",
  description: "",
};

const GetHomeHero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [allHeroes, setAllHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // --- Inline edit panel state ---
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // --- Inline delete-confirm panel state ---
  const [pendingDeleteHero, setPendingDeleteHero] = useState(null);

  const editPanelRef = useRef(null);
  const deletePanelRef = useRef(null);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/homeheros");
      setAllHeroes(Array.isArray(res.data) ? res.data : res.data ? [res.data] : []);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || t("getHomeHero.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll: show more rows as the user scrolls down
  const [visibleCount, setVisibleCount] = useState(HEROES_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const heroes = allHeroes.slice(0, visibleCount);
  const hasMore = visibleCount < allHeroes.length;

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + HEROES_PER_PAGE);
      setLoadingMore(false);
    }, 400);
  };

  // --- Edit panel open/close ---
  const handleEditClick = (hero) => {
    // Close any open delete-confirm panel first
    setPendingDeleteHero(null);

    setEditingId(hero.id);
    setFormError("");
    setForm({
      title: hero.title || "",
      description: hero.description || "",
    });
    setExistingImageUrl(hero.image || "");
    setImage(null);
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
    setPreview(null);
    setExistingImageUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    if (!stripHtml(form.title)) {
      setFormError("Title is required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);

      if (image) formData.append("image", image);

      await API.put(`/homeheros/${editingId}`, formData);

      alert(t("getHomeHero.messages.updateSuccess"));
      handleCancelEdit();
      await fetchHeroes();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.msg || t("getHomeHero.messages.updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete panel open/close ---
  const handleDeleteClick = (hero) => {
    // Close any open edit panel first
    handleCancelEdit();

    setPendingDeleteHero(hero);

    requestAnimationFrame(() => {
      deletePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const cancelDelete = () => {
    setPendingDeleteHero(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteHero) return;
    const id = pendingDeleteHero.id;

    try {
      setDeletingId(id);

      await API.delete(`/homeheros/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchHeroes();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || t("getHomeHero.messages.deleteError"));
    } finally {
      setDeletingId(null);
      setPendingDeleteHero(null);
    }
  };

  return (
    <div className="ghh-page">
      <div className="ghh-card rte-page-shell">
        <div className="ghh-header">
          <h2 className="ghh-title">{t("getHomeHero.pageTitle")}</h2>

          {!editingId && !pendingDeleteHero && (
            <button className="ghh-new-btn" onClick={() => navigate("/admin/hero/create")}>
              {t("getHomeHero.newButton")}
            </button>
          )}
        </div>

        {error && <p className="ghh-error">{error}</p>}

        {/* ===== Inline full-width edit panel ===== */}
        {editingId && (
          <div ref={editPanelRef} className="ghh-panel">
            <h3 className="ghh-panel-title">{t("getHomeHero.editTitle")}</h3>

            {formError && <p className="ghh-error">{formError}</p>}

            <RichTextProvider>
              <div className="rte-editor-shell">
                <RichTextToolbar />
                <RichTextContextMenu />
                <div className="rte-scroll-area">
                  <form onSubmit={handleSubmit} className="ghh-form">
                  <RichTextField
                    id="rt-title"
                    value={form.title}
                    onChange={(html) => setForm((prev) => ({ ...prev, title: html }))}
                    placeholder={t("getHomeHero.form.titlePlaceholder")}
                    minHeight="44px"
                    toolbar="minimal"
                  />
    
                  <RichTextField
      id="rt-description"
                    value={form.description}
                    onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                    placeholder={t("getHomeHero.form.descriptionPlaceholder")}
                    minHeight="100px"
                  />
    
                  <div>
                    <label className="ghh-file-label">{t("getHomeHero.form.heroImageLabel")}</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {(preview || existingImageUrl) && (
                      <img src={preview || existingImageUrl} alt="Hero" className="ghh-file-preview" />
                    )}
                  </div>
    
                  <div className="ghh-form-actions">
                    <button type="submit" disabled={submitting} className="ghh-btn-primary">
                      {submitting ? t("getHomeHero.buttons.saving") : t("getHomeHero.buttons.save")}
                    </button>
    
                    <button type="button" onClick={handleCancelEdit} disabled={submitting} className="ghh-btn-secondary">
                      {t("getHomeHero.buttons.cancel")}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </RichTextProvider>
          </div>
        )}

        {/* ===== Inline full-width delete-confirm panel ===== */}
        {pendingDeleteHero && (
          <div ref={deletePanelRef} className="ghh-panel ghh-delete-panel">
            <h3 className="ghh-panel-title">{t("getHomeHero.messages.confirmDeleteTitle")}</h3>

            <p className="ghh-panel-body-text">
              {pendingDeleteHero?.title
                ? t("getHomeHero.messages.confirmDeleteNamed", { title: pendingDeleteHero.title })
                : t("getHomeHero.messages.confirmDelete")}
            </p>

            <div className="ghh-form-actions">
              <button
                className="ghh-btn-danger"
                onClick={confirmDelete}
                disabled={deletingId === pendingDeleteHero?.id}
              >
                {deletingId === pendingDeleteHero?.id
                  ? t("getHomeHero.buttons.deleting")
                  : t("getHomeHero.buttons.confirmDelete")}
              </button>

              <button
                className="ghh-btn-secondary"
                onClick={cancelDelete}
                disabled={deletingId === pendingDeleteHero?.id}
              >
                {t("getHomeHero.buttons.cancel")}
              </button>
            </div>
          </div>
        )}

        {!editingId &&
          !pendingDeleteHero &&
          (loading ? (
            <p>{t("getHomeHero.loading")}</p>
          ) : allHeroes.length === 0 ? (
            <p>{t("getHomeHero.noEntries")}</p>
          ) : (
            <>
              {/* ===== Desktop table (hidden <= 820px via CSS) ===== */}
              <div className="ghh-table-wrap">
                <table className="ghh-table">
                  <thead>
                    <tr>
                      <th className="ghh-th">{t("getHomeHero.table.title")}</th>
                      <th className="ghh-th">{t("getHomeHero.table.created")}</th>
                      <th className="ghh-th">{t("getHomeHero.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroes.map((hero) => (
                      <tr key={hero.id}>
                        <td className="ghh-td">{stripHtml(hero.title)}</td>
                        <td className="ghh-td">
                          {hero.createdAt ? new Date(hero.createdAt).toLocaleDateString() : t("getHomeHero.table.notAvailable")}
                        </td>
                        <td className="ghh-td">
                          <div className="ghh-actions">
                            <button
                              type="button"
                              className="ghh-btn ghh-btn-edit"
                              onClick={() => handleEditClick(hero)}
                            >
                              {t("getHomeHero.buttons.edit")}
                            </button>
                            <button
                              type="button"
                              className="ghh-btn ghh-btn-delete"
                              disabled={deletingId === hero.id}
                              onClick={() => handleDeleteClick(hero)}
                            >
                              {deletingId === hero.id ? t("getHomeHero.buttons.deleting") : t("getHomeHero.buttons.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ===== Mobile/tablet card list (shown <= 820px via CSS) ===== */}
              <div className="ghh-cards">
                {heroes.map((hero) => (
                  <div className="ghh-card-item" key={hero.id}>
                    <div className="ghh-card-row">
                      <span className="ghh-card-label">{t("getHomeHero.table.title")}</span>
                      <span className="ghh-card-value">{stripHtml(hero.title)}</span>
                    </div>
                    <div className="ghh-card-row">
                      <span className="ghh-card-label">{t("getHomeHero.table.created")}</span>
                      <span className="ghh-card-value">
                        {hero.createdAt ? new Date(hero.createdAt).toLocaleDateString() : t("getHomeHero.table.notAvailable")}
                      </span>
                    </div>

                    <div className="ghh-card-actions">
                      <button
                              type="button"
                              className="ghh-btn ghh-btn-edit"
                              onClick={() => handleEditClick(hero)}
                            >
                              {t("getHomeHero.buttons.edit")}
                            </button>
                            <button
                              type="button"
                              className="ghh-btn ghh-btn-delete"
                              disabled={deletingId === hero.id}
                              onClick={() => handleDeleteClick(hero)}
                            >
                              {deletingId === hero.id ? t("getHomeHero.buttons.deleting") : t("getHomeHero.buttons.delete")}
                            </button>
                    </div>
                  </div>
                ))}
              </div>

              <InfiniteScrollSentinel
                hasMore={hasMore}
                loading={loadingMore}
                onLoadMore={loadMore}
                text={t("getHomeHero.loadingMore", "Loading more...")}
              />
            </>
          ))}
      </div>
    </div>
  );
};

export default GetHomeHero;