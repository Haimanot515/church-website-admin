import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetHomeHero.css";

const HEROES_PER_PAGE = 10;

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  quote: "",
  name: "",
  role: "",
  story: "",
};

const GetHomeHero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [allHeroes, setAllHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  // --- Inline edit panel state ---
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingStoryImageUrl, setExistingStoryImageUrl] = useState("");
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

  const totalPages = Math.max(1, Math.ceil(allHeroes.length / HEROES_PER_PAGE));
  const heroes = allHeroes.slice(
    (currentPage - 1) * HEROES_PER_PAGE,
    currentPage * HEROES_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // --- Edit panel open/close ---
  const handleEditClick = (hero) => {
    // Close any open delete-confirm panel first
    setPendingDeleteHero(null);

    setEditingId(hero._id);
    setFormError("");
    setForm({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      description: hero.description || "",
      quote: hero.quote || "",
      name: hero.name || "",
      role: hero.role || "",
      story: hero.story || "",
    });
    setExistingImageUrl(hero.image || "");
    setExistingStoryImageUrl(hero.storyImage || "");
    setImage(null);
    setStoryImage(null);
    setPreview(null);
    setStoryPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
    setStoryImage(null);
    setPreview(null);
    setStoryPreview(null);
    setExistingImageUrl("");
    setExistingStoryImageUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "hero") {
      setImage(file);
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setStoryImage(file);
      if (file) setStoryPreview(URL.createObjectURL(file));
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
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description);
      formData.append("quote", form.quote);
      formData.append("name", form.name);
      formData.append("role", form.role);
      formData.append("story", form.story);

      if (image) formData.append("image", image);
      if (storyImage) formData.append("storyImage", storyImage);

      await API.put(`/homeheros/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    const id = pendingDeleteHero._id;

    try {
      setDeletingId(id);

      await API.delete(`/homeheros/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchHeroes();

      const remaining = allHeroes.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / HEROES_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || t("getHomeHero.messages.deleteError"));
    } finally {
      setDeletingId(null);
      setPendingDeleteHero(null);
    }
  };

  return (
    <div className="hh-page">
      <div className="hh-card">
        <div className="hh-header">
          <h2 className="hh-title">{t("getHomeHero.pageTitle")}</h2>

          {!editingId && !pendingDeleteHero && (
            <button className="hh-new-btn" onClick={() => navigate("/admin/hero/create")}>
              {t("getHomeHero.newButton")}
            </button>
          )}
        </div>

        {error && <p className="hh-error">{error}</p>}

        {/* ===== Inline full-width edit panel ===== */}
        {editingId && (
          <div ref={editPanelRef} className="hh-panel">
            <h3 className="hh-panel-title">{t("getHomeHero.editTitle")}</h3>

            {formError && <p className="hh-error">{formError}</p>}

            <form onSubmit={handleSubmit} className="hh-form">
              <input
                type="text"
                name="title"
                placeholder={t("getHomeHero.form.titlePlaceholder")}
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="subtitle"
                placeholder={t("getHomeHero.form.subtitlePlaceholder")}
                value={form.subtitle}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder={t("getHomeHero.form.descriptionPlaceholder")}
                value={form.description}
                onChange={handleChange}
                rows="3"
              />

              <textarea
                name="quote"
                placeholder={t("getHomeHero.form.quotePlaceholder")}
                value={form.quote}
                onChange={handleChange}
                rows="2"
              />

              <div className="hh-form-grid-2">
                <input
                  type="text"
                  name="name"
                  placeholder={t("getHomeHero.form.namePlaceholder")}
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="role"
                  placeholder={t("getHomeHero.form.rolePlaceholder")}
                  value={form.role}
                  onChange={handleChange}
                />
              </div>

              <textarea
                name="story"
                placeholder={t("getHomeHero.form.storyPlaceholder")}
                value={form.story}
                onChange={handleChange}
                rows="6"
              />

              <div className="hh-form-grid-2">
                <div>
                  <label className="hh-file-label">{t("getHomeHero.form.heroImageLabel")}</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "hero")} />
                  {(preview || existingImageUrl) && (
                    <img src={preview || existingImageUrl} alt="Hero" className="hh-file-preview" />
                  )}
                </div>

                <div>
                  <label className="hh-file-label">{t("getHomeHero.form.storyImageLabel")}</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "story")} />
                  {(storyPreview || existingStoryImageUrl) && (
                    <img src={storyPreview || existingStoryImageUrl} alt="Story" className="hh-file-preview" />
                  )}
                </div>
              </div>

              <div className="hh-form-actions">
                <button type="submit" disabled={submitting} className="hh-btn-primary">
                  {submitting ? t("getHomeHero.buttons.saving") : t("getHomeHero.buttons.save")}
                </button>

                <button type="button" onClick={handleCancelEdit} disabled={submitting} className="hh-btn-secondary">
                  {t("getHomeHero.buttons.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== Inline full-width delete-confirm panel ===== */}
        {pendingDeleteHero && (
          <div ref={deletePanelRef} className="hh-panel hh-delete-panel">
            <h3 className="hh-panel-title">{t("getHomeHero.messages.confirmDeleteTitle")}</h3>

            <p className="hh-panel-body-text">
              {pendingDeleteHero?.title
                ? t("getHomeHero.messages.confirmDeleteNamed", { title: pendingDeleteHero.title })
                : t("getHomeHero.messages.confirmDelete")}
            </p>

            <div className="hh-form-actions">
              <button
                className="hh-btn-danger"
                onClick={confirmDelete}
                disabled={deletingId === pendingDeleteHero?._id}
              >
                {deletingId === pendingDeleteHero?._id
                  ? t("getHomeHero.buttons.deleting")
                  : t("getHomeHero.buttons.confirmDelete")}
              </button>

              <button
                className="hh-btn-secondary"
                onClick={cancelDelete}
                disabled={deletingId === pendingDeleteHero?._id}
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
              <div className="hh-table-wrap">
                <table className="hh-table">
                  <thead>
                    <tr>
                      <th className="hh-th">{t("getHomeHero.table.title")}</th>
                      <th className="hh-th">{t("getHomeHero.table.name")}</th>
                      <th className="hh-th">{t("getHomeHero.table.role")}</th>
                      <th className="hh-th">{t("getHomeHero.table.created")}</th>
                      <th className="hh-th">{t("getHomeHero.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroes.map((hero) => (
                      <tr key={hero._id}>
                        <td className="hh-td">{hero.title}</td>
                        <td className="hh-td">{hero.name || t("getHomeHero.table.notAvailable")}</td>
                        <td className="hh-td">{hero.role || t("getHomeHero.table.notAvailable")}</td>
                        <td className="hh-td">
                          {hero.createdAt ? new Date(hero.createdAt).toLocaleDateString() : t("getHomeHero.table.notAvailable")}
                        </td>
                        <td className="hh-td">
                          <div className="hh-actions">
                            <button className="hh-btn hh-btn-edit" onClick={() => handleEditClick(hero)}>
                              {t("getHomeHero.buttons.edit")}
                            </button>

                            <button
                              className="hh-btn hh-btn-delete"
                              onClick={() => handleDeleteClick(hero)}
                              disabled={deletingId === hero._id}
                            >
                              {deletingId === hero._id
                                ? t("getHomeHero.buttons.deleting")
                                : t("getHomeHero.buttons.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ===== Mobile/tablet card list (shown <= 820px via CSS) ===== */}
              <div className="hh-cards">
                {heroes.map((hero) => (
                  <div className="hh-card-item" key={hero._id}>
                    <div className="hh-card-row">
                      <span className="hh-card-label">{t("getHomeHero.table.title")}</span>
                      <span className="hh-card-value">{hero.title}</span>
                    </div>
                    <div className="hh-card-row">
                      <span className="hh-card-label">{t("getHomeHero.table.name")}</span>
                      <span className="hh-card-value">{hero.name || t("getHomeHero.table.notAvailable")}</span>
                    </div>
                    <div className="hh-card-row">
                      <span className="hh-card-label">{t("getHomeHero.table.role")}</span>
                      <span className="hh-card-value">{hero.role || t("getHomeHero.table.notAvailable")}</span>
                    </div>
                    <div className="hh-card-row">
                      <span className="hh-card-label">{t("getHomeHero.table.created")}</span>
                      <span className="hh-card-value">
                        {hero.createdAt ? new Date(hero.createdAt).toLocaleDateString() : t("getHomeHero.table.notAvailable")}
                      </span>
                    </div>

                    <div className="hh-card-actions">
                      <button className="hh-btn hh-btn-edit" onClick={() => handleEditClick(hero)}>
                        {t("getHomeHero.buttons.edit")}
                      </button>
                      <button
                        className="hh-btn hh-btn-delete"
                        onClick={() => handleDeleteClick(hero)}
                        disabled={deletingId === hero._id}
                      >
                        {deletingId === hero._id
                          ? t("getHomeHero.buttons.deleting")
                          : t("getHomeHero.buttons.delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="hh-pagination">
                  <button
                    className="hh-page-btn"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t("getHomeHero.pagination.prev")}
                  </button>

                  <span className="hh-page-info">
                    {t("getHomeHero.pagination.pageOf", { current: currentPage, total: totalPages })}
                  </span>

                  <button
                    className="hh-page-btn"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t("getHomeHero.pagination.next")}
                  </button>
                </div>
              )}
            </>
          ))}
      </div>
    </div>
  );
};

export default GetHomeHero;