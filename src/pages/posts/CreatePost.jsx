import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreatePost.css";

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

    const selectedLang = languages.find((l) => l._id === post.language);
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

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("description", post.description);
      formData.append("content", post.content);
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
      <div className="cp-page">
        <div className="cp-pageLoading">
          <div className="cp-pageSpinner" />
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
    <div className="cp-page">
      <div className="cp-card">
        <h2 className="cp-title">{t("createPost.heading")}</h2>

        {error && <p className="cp-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cp-form">
          {/* ===== Required fields ===== */}

          {/* Language comes first among the required fields, since
              category options depend on which language is selected */}
          <label className="cp-label" htmlFor="cp-language">
            {t("createPost.form.languageLabel")}
            <span className="cp-required"> *</span>
          </label>
          <select
            id="cp-language"
            name="language"
            value={post.language}
            onChange={handleChange}
            required
            className="cp-select"
          >
            <option value="">{t("createPost.form.selectLanguage")}</option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <label className="cp-label" htmlFor="cp-title">
            {t("createPost.form.titleLabel")}
            <span className="cp-required"> *</span>
          </label>
          <input
            id="cp-title"
            type="text"
            name="title"
            placeholder={t("createPost.form.titlePlaceholder")}
            value={post.title}
            onChange={handleChange}
            required
            className="cp-input"
          />

          <label className="cp-label" htmlFor="cp-description">
            {t("createPost.form.descriptionLabel")}
            <span className="cp-required"> *</span>
          </label>
          <textarea
            id="cp-description"
            name="description"
            placeholder={t("createPost.form.descriptionPlaceholder")}
            value={post.description}
            onChange={handleChange}
            rows="3"
            required
            className="cp-textarea"
          />

          <label className="cp-label" htmlFor="cp-content">
            {t("createPost.form.contentLabel")}
            <span className="cp-required"> *</span>
          </label>
          <textarea
            id="cp-content"
            name="content"
            placeholder={t("createPost.form.contentPlaceholder")}
            value={post.content}
            onChange={handleChange}
            rows="8"
            required
            className="cp-textarea"
          />

          {/* Category is scoped to the selected language, so it stays
              hidden until a language is chosen and its categories have
              actually finished fetching from the backend. */}
          {post.language && (
            <>
              <label className="cp-label" htmlFor="cp-category">
                {t("createPost.form.categoryLabel")}
                <span className="cp-required"> *</span>
              </label>
              {categoriesLoading ? (
                <div className="cp-inlineLoading">
                  <span className="cp-inlineSpinner" aria-hidden="true" />
                  <span>{t("createPost.form.loadingCategories")}</span>
                </div>
              ) : (
                <select
                  id="cp-category"
                  name="category"
                  value={post.category}
                  onChange={handleChange}
                  required
                  className="cp-select"
                >
                  <option value="">
                    {categories.length === 0
                      ? t("createPost.form.noCategoriesForLanguage")
                      : t("createPost.form.selectCategory")}
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

          {/* ===== Optional fields ===== */}

          <label className="cp-fileLabel" htmlFor="cp-image">
            {t("createPost.form.uploadImageLabel")}
            <span className="cp-optional"> ({t("createPost.form.optional")})</span>
            <input
              id="cp-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cp-fileInput"
            />
          </label>

          {preview && (
            <img src={preview} alt={t("createPost.form.imageAlt")} className="cp-file-preview" />
          )}

          <label className="cp-label" htmlFor="cp-status">
            {t("createPost.form.statusLabel")}
            <span className="cp-optional"> ({t("createPost.form.optional")})</span>
          </label>
          <select
            id="cp-status"
            name="status"
            value={post.status}
            onChange={handleChange}
            className="cp-select"
          >
            <option value="draft">{t("createPost.form.draft")}</option>
            <option value="published">{t("createPost.form.published")}</option>
          </select>

          <label className="cp-checkboxLabel">
            <input
              type="checkbox"
              name="isTrending"
              checked={post.isTrending}
              onChange={handleChange}
              className="cp-checkbox"
            />
            {t("createPost.form.trending")}
          </label>

          <label className="cp-checkboxLabel">
            <input
              type="checkbox"
              name="isFeatured"
              checked={post.isFeatured}
              onChange={handleChange}
              className="cp-checkbox"
            />
            {t("createPost.form.featured")}
          </label>

          <label className="cp-checkboxLabel">
            <input
              type="checkbox"
              name="isRecommended"
              checked={post.isRecommended}
              onChange={handleChange}
              className="cp-checkbox"
            />
            {t("createPost.form.recommended")}
          </label>

          <button
            type="submit"
            disabled={loading || !post.language || !post.category}
            className="cp-btn-primary"
          >
            {loading ? t("createPost.form.creating") : t("createPost.form.create")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;