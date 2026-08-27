import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetPost.css";

const POSTS_PER_PAGE = 10;

const emptyForm = {
  title: "",
  description: "",
  content: "",
  category: "",
  language: "",
  isTrending: false,
  isFeatured: false,
  isRecommended: false,
  status: "draft",
  image: null,
};

const GetPost = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchPosts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        setLanguages(Array.isArray(res.data) ? res.data : res.data.languages || []);
      } catch (err) {
        console.log(err);
        setError((prev) => prev || t("post.errors.loadOptions"));
      } finally {
        setLanguagesLoading(false);
      }
    };

    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingId || !form.language) {
      setCategories([]);
      return;
    }

    const selectedLang = languages.find((l) => l._id === form.language);
    if (!selectedLang) return;

    const fetchCategoriesForLanguage = async () => {
      try {
        setCategoriesLoading(true);
        const res = await API.get("/categories", {
          headers: { "Accept-Language": selectedLang.code },
        });
        setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
      } catch (err) {
        console.log(err);
        setFormError(t("post.errors.loadCategories"));
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategoriesForLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, form.language, languages]);

  const fetchPosts = async (page) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/posts", {
        params: { page, limit: POSTS_PER_PAGE },
      });

      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("post.errors.loadPosts"));
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleEditClick = (post) => {
    setEditingId(post._id);
    setFormError("");
    setForm({
      title: post.title || "",
      description: post.description || "",
      content: post.content || "",
      category: post.category?._id || "",
      language: post.language?._id || "",
      isTrending: !!post.isTrending,
      isFeatured: !!post.isFeatured,
      isRecommended: !!post.isRecommended,
      status: post.status || "draft",
      image: null,
    });
    setExistingImageUrl(post.imageUrl || "");
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setExistingImageUrl("");
    setFormError("");
    setCategories([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "language") {
      setForm((prev) => ({
        ...prev,
        language: value,
        category: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
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
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("language", form.language);
      formData.append("isTrending", form.isTrending);
      formData.append("isFeatured", form.isFeatured);
      formData.append("isRecommended", form.isRecommended);
      formData.append("status", form.status);

      if (form.image) {
        formData.append("image", form.image);
      }

      await API.put(`/posts/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("post.updateSuccess"));
      handleCancelEdit();
      await fetchPosts(currentPage);
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("post.errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("post.confirmDelete"))) {
      return;
    }

    try {
      setDeletingId(id);

      await API.delete(`/posts/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchPosts(currentPage);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("post.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="gp-page">
      <div className="gp-card">
        <div className="gp-header">
          <h2>{t("post.heading")}</h2>

          {!editingId && (
            <button className="gp-btn-new" onClick={() => navigate("/admin/posts/create")}>
              {t("post.newPost")}
            </button>
          )}
        </div>

        {error && <p className="gp-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="gp-edit-panel">
            <h3>{t("post.editHeading")}</h3>

            {formError && <p className="gp-error">{formError}</p>}

            {languagesLoading ? (
              <div className="gp-panelLoading">
                <div className="gp-panelSpinner" />
                <span>{t("post.form.loadingLanguages")}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="gp-form">
                <label className="gp-label" htmlFor="gp-language">
                  {t("post.form.languageLabel")}
                  <span className="gp-required"> *</span>
                </label>
                <select
                  id="gp-language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  required
                  className="gp-select"
                >
                  <option value="">{t("post.form.selectLanguage")}</option>
                  {languages.map((lang) => (
                    <option key={lang._id} value={lang._id}>
                      {lang.name}
                    </option>
                  ))}
                </select>

                <label className="gp-label" htmlFor="gp-title">
                  {t("post.form.titleLabel")}
                  <span className="gp-required"> *</span>
                </label>
                <input
                  id="gp-title"
                  type="text"
                  name="title"
                  placeholder={t("post.form.titlePlaceholder")}
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="gp-input"
                />

                <label className="gp-label" htmlFor="gp-description">
                  {t("post.form.descriptionLabel")}
                  <span className="gp-required"> *</span>
                </label>
                <textarea
                  id="gp-description"
                  name="description"
                  placeholder={t("post.form.descriptionPlaceholder")}
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="gp-textarea"
                />

                <label className="gp-label" htmlFor="gp-content">
                  {t("post.form.contentLabel")}
                  <span className="gp-required"> *</span>
                </label>
                <textarea
                  id="gp-content"
                  name="content"
                  placeholder={t("post.form.contentPlaceholder")}
                  value={form.content}
                  onChange={handleChange}
                  rows="8"
                  required
                  className="gp-textarea"
                />

                {form.language && (
                  <>
                    <label className="gp-label" htmlFor="gp-category">
                      {t("post.form.categoryLabel")}
                      <span className="gp-required"> *</span>
                    </label>
                    {categoriesLoading ? (
                      <div className="gp-inlineLoading">
                        <span className="gp-inlineSpinner" aria-hidden="true" />
                        <span>{t("post.form.loadingCategories")}</span>
                      </div>
                    ) : (
                      <select
                        id="gp-category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="gp-select"
                      >
                        <option value="">
                          {categories.length === 0
                            ? t("post.form.noCategoriesForLanguage")
                            : t("post.form.selectCategory")}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}

                <label className="gp-fileLabel" htmlFor="gp-image">
                  {t("post.form.uploadImageLabel")}
                  <span className="gp-optional"> ({t("post.form.optional")})</span>
                  <input
                    id="gp-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="gp-fileInput"
                  />
                </label>

                {(preview || existingImageUrl) && (
                  <img
                    src={preview || existingImageUrl}
                    alt={t("post.form.imageAlt")}
                    className="gp-file-preview"
                  />
                )}

                <label className="gp-label" htmlFor="gp-status">
                  {t("post.form.statusLabel")}
                  <span className="gp-optional"> ({t("post.form.optional")})</span>
                </label>
                <select
                  id="gp-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="gp-select"
                >
                  <option value="draft">{t("post.form.draft")}</option>
                  <option value="published">{t("post.form.published")}</option>
                </select>

                <label className="gp-checkbox-label">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={form.isTrending}
                    onChange={handleChange}
                  />
                  {t("post.form.trending")}
                </label>

                <label className="gp-checkbox-label">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                  {t("post.form.featured")}
                </label>

                <label className="gp-checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecommended"
                    checked={form.isRecommended}
                    onChange={handleChange}
                  />
                  {t("post.form.recommended")}
                </label>

                <div className="gp-form-actions">
                  <button
                    type="submit"
                    disabled={submitting || !form.language || !form.category}
                    className="gp-btn-primary"
                  >
                    {submitting ? t("post.form.saving") : t("post.form.saveChanges")}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                    className="gp-btn-cancel"
                  >
                    {t("post.form.cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!editingId &&
          (loading ? (
            <div className="gp-panelLoading">
              <div className="gp-panelSpinner" />
              <span>{t("post.loadingPosts")}</span>
            </div>
          ) : posts.length === 0 ? (
            <p>{t("post.noPosts")}</p>
          ) : (
            <>
              <div className="gp-table-wrap">
                <table className="gp-table">
                  <thead>
                    <tr>
                      <th>{t("post.table.title")}</th>
                      <th>{t("post.table.category")}</th>
                      <th>{t("post.table.language")}</th>
                      <th>{t("post.table.status")}</th>
                      <th>{t("post.table.author")}</th>
                      <th>{t("post.table.created")}</th>
                      <th>{t("post.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post._id}>
                        <td data-label={t("post.table.title")}>{post.title}</td>
                        <td data-label={t("post.table.category")}>{post.category?.name || "—"}</td>
                        <td data-label={t("post.table.language")}>{post.language?.name || "—"}</td>
                        <td data-label={t("post.table.status")}>
                          <span
                            className={`gp-status-badge ${
                              post.status === "published" ? "gp-status-published" : "gp-status-draft"
                            }`}
                          >
                            {post.status === "published" ? t("post.form.published") : t("post.form.draft")}
                          </span>
                        </td>
                        <td data-label={t("post.table.author")}>{post.author?.name || "—"}</td>
                        <td data-label={t("post.table.created")}>
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td data-label={t("post.table.actions")}>
                          <div className="gp-row-actions">
                            <button className="gp-btn-edit" onClick={() => handleEditClick(post)}>
                              {t("post.actions.edit")}
                            </button>

                            <button
                              className="gp-btn-delete"
                              onClick={() => handleDelete(post._id)}
                              disabled={deletingId === post._id}
                            >
                              {deletingId === post._id ? t("post.actions.deleting") : t("post.actions.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="gp-pagination">
                <button
                  className="gp-page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t("post.pagination.prev")}
                </button>

                <span className="gp-page-info">
                  {t("post.pagination.pageOf", { current: currentPage, total: totalPages })}
                </span>

                <button
                  className="gp-page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t("post.pagination.next")}
                </button>
              </div>
            </>
          ))}
      </div>
    </div>
  );
};

export default GetPost;