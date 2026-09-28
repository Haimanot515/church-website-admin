import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreatePost.css";
import "../shared/AdminShared.css";

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreatePost = () => {
  const { t } = useTranslation();
  const [post, setPost] = useState({
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
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Controls the initial fetch of languages — while true, the form is
  // hidden and a centered spinner is shown instead (matches CreateChurch).
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch languages once on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(Array.isArray(res.data) ? res.data : res.data.languages || []);
      } catch (err) {
        console.log(err);
        setError(t("createPost.errors.loadLanguages"));
      } finally {
        setPageLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  // Re-fetch categories whenever the selected language changes, scoped
  // to that language specifically — since admin api.js sends no
  // Accept-Language on its own, this header override is the only thing
  // that decides which language's categories come back.
  useEffect(() => {
    if (!post.language) {
      setCategories([]);
      return;
    }
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    const selectedLang = languages.find((l) => l.id === post.language);
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
        setError(t("createPost.errors.loadCategories"));
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategoriesForLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.language, languages]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "language") {
      // Changing language invalidates whatever category was selected,
      // since categories are scoped per language
      setPost((prev) => ({
        ...prev,
        language: value,
        category: "",
      }));
      return;
    }
    setPost({
      ...post,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPost({ ...post, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // RichTextField is a contenteditable, not an <input>/<textarea>, so it
    // can't rely on the native `required` attribute — check the plain-text
    // content of each converted field instead.
    if (!stripHtml(post.title)) {
      setError(t("createPost.errors.titleRequired"));
      return;
    }
    if (!stripHtml(post.description)) {
      setError(t("createPost.errors.descriptionRequired"));
      return;
    }
    if (!stripHtml(post.content)) {
      setError(t("createPost.errors.contentRequired"));
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("description", post.description);
      formData.append("content", post.content);
      // These are now PostgreSQL UUIDs
      formData.append("category", post.category);
      formData.append("language", post.language);
      formData.append("isTrending", post.isTrending);
      formData.append("isFeatured", post.isFeatured);
      formData.append("isRecommended", post.isRecommended);
      formData.append("status", post.status);
      if (post.image) {
        formData.append("image", post.image);
      }
      // Auth header is already attached globally by the API interceptor
      await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(t("createPost.createSuccess"));
      setPost({
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
      });
      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createPost.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form until the initial backend data (languages) has
  // finished loading — avoids flashing an unusable/empty form first.
  if (pageLoading) {
    return (
      <div className="cpost-page">
        <div className="cpost-pageLoading">
          <div className="cpost-pageSpinner" />
          <style>{`
            @keyframes cpPageSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="cpost-page">
      <div className="cpost-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2 className="cpost-title">{t("createPost.heading")}</h2>
            {error && <p className="cpost-error">{error}</p>}
            <form onSubmit={handleSubmit} className="cpost-form">
              {/* ===== Required fields ===== */}
              {/* Language comes first among the required fields, since
                  category options depend on which language is selected */}
              <label className="cpost-label" htmlFor="cpost-language">
                {t("createPost.form.languageLabel")}
                <span className="cpost-required"> *</span>
              </label>
              <select
                id="cpost-language"
                name="language"
                value={post.language}
                onChange={handleChange}
                required
                className="cpost-select"
              >
                <option value="">{t("createPost.form.selectLanguage")}</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>

              <label className="cpost-label" htmlFor="cpost-title">
                {t("createPost.form.titleLabel")}
                <span className="cpost-required"> *</span>
              </label>
              <RichTextField
                id="cpost-title"
                value={post.title}
                onChange={(html) => setPost((prev) => ({ ...prev, title: html }))}
                placeholder={t("createPost.form.titlePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <label className="cpost-label" htmlFor="cpost-description">
                {t("createPost.form.descriptionLabel")}
                <span className="cpost-required"> *</span>
              </label>
              <RichTextField
                id="cpost-description"
                value={post.description}
                onChange={(html) => setPost((prev) => ({ ...prev, description: html }))}
                placeholder={t("createPost.form.descriptionPlaceholder")}
                minHeight="90px"
              />

              <label className="cpost-label" htmlFor="cpost-content">
                {t("createPost.form.contentLabel")}
                <span className="cpost-required"> *</span>
              </label>
              <RichTextField
                id="cpost-content"
                value={post.content}
                onChange={(html) => setPost((prev) => ({ ...prev, content: html }))}
                placeholder={t("createPost.form.contentPlaceholder")}
                minHeight="240px"
              />

              {/* Category is scoped to the selected language, so it stays
                  hidden until a language is chosen and its categories have
                  actually finished fetching from the backend. */}
              {post.language && (
                <>
                  <label className="cpost-label" htmlFor="cpost-category">
                    {t("createPost.form.categoryLabel")}
                    <span className="cpost-required"> *</span>
                  </label>
                  {categoriesLoading ? (
                    <div className="cpost-inlineLoading">
                      <span className="cpost-inlineSpinner" aria-hidden="true" />
                      <span>{t("createPost.form.loadingCategories")}</span>
                    </div>
                  ) : (
                    <select
                      id="cpost-category"
                      name="category"
                      value={post.category}
                      onChange={handleChange}
                      required
                      className="cpost-select"
                    >
                      <option value="">
                        {categories.length === 0
                          ? t("createPost.form.noCategoriesForLanguage")
                          : t("createPost.form.selectCategory")}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              {/* ===== Optional fields ===== */}
              <label className="cpost-fileLabel" htmlFor="cpost-image">
                {t("createPost.form.uploadImageLabel")}
                <span className="cpost-optional"> ({t("createPost.form.optional")})</span>
                <input
                  id="cpost-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cpost-fileInput"
                />
              </label>
              {preview && (
                <img src={preview} alt={t("createPost.form.imageAlt")} className="cpost-file-preview" />
              )}

              <label className="cpost-label" htmlFor="cpost-status">
                {t("createPost.form.statusLabel")}
                <span className="cpost-optional"> ({t("createPost.form.optional")})</span>
              </label>
              <select
                id="cpost-status"
                name="status"
                value={post.status}
                onChange={handleChange}
                className="cpost-select"
              >
                <option value="draft">{t("createPost.form.draft")}</option>
                <option value="published">{t("createPost.form.published")}</option>
              </select>

              <label className="cpost-checkboxLabel">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={post.isTrending}
                  onChange={handleChange}
                  className="cpost-checkbox"
                />
                {t("createPost.form.trending")}
              </label>
              <label className="cpost-checkboxLabel">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={post.isFeatured}
                  onChange={handleChange}
                  className="cpost-checkbox"
                />
                {t("createPost.form.featured")}
              </label>
              <label className="cpost-checkboxLabel">
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={post.isRecommended}
                  onChange={handleChange}
                  className="cpost-checkbox"
                />
                {t("createPost.form.recommended")}
              </label>

              <button
                type="submit"
                disabled={loading || !post.language || !post.category}
                className="cpost-btn-primary"
              >
                {loading ? t("createPost.form.creating") : t("createPost.form.create")}
              </button>
            </form>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreatePost;