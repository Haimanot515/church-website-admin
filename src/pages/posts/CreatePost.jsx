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
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch languages once on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const res = await API.get("/languages");
        setLanguages(Array.isArray(res.data) ? res.data : res.data.languages || []);
      } catch (err) {
        console.log(err);
        setError(t("createPost.errors.loadLanguages"));
      } finally {
        setLanguagesLoading(false);
      }
    };
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="cp-page">
      <div className="cp-card">
        <h2 className="cp-title">{t("createPost.heading")}</h2>

        {error && <p className="cp-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cp-form">
          <input
            type="text"
            name="title"
            placeholder={t("createPost.form.titlePlaceholder")}
            value={post.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder={t("createPost.form.descriptionPlaceholder")}
            value={post.description}
            onChange={handleChange}
            rows="3"
            required
          />

          <textarea
            name="content"
            placeholder={t("createPost.form.contentPlaceholder")}
            value={post.content}
            onChange={handleChange}
            rows="8"
            required
          />

          {/* Language comes BEFORE category, since category options
              depend on which language is selected */}
          <select
            name="language"
            value={post.language}
            onChange={handleChange}
            required
            disabled={languagesLoading}
          >
            <option value="">
              {languagesLoading ? t("createPost.form.loadingLanguages") : t("createPost.form.selectLanguage")}
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

          <select
            name="category"
            value={post.category}
            onChange={handleChange}
            required
            disabled={!post.language || categoriesLoading}
          >
            <option value="">
              {!post.language
                ? t("createPost.form.selectLanguageFirst")
                : categoriesLoading
                ? t("createPost.form.loadingCategories")
                : categories.length === 0
                ? t("createPost.form.noCategoriesForLanguage")
                : t("createPost.form.selectCategory")}
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && <img src={preview} alt="preview" className="cp-file-preview" />}

          <select name="status" value={post.status} onChange={handleChange}>
            <option value="draft">{t("createPost.form.draft")}</option>
            <option value="published">{t("createPost.form.published")}</option>
          </select>

          <label className="cp-checkbox-label">
            <input type="checkbox" name="isTrending" checked={post.isTrending} onChange={handleChange} />
            {t("createPost.form.trending")}
          </label>

          <label className="cp-checkbox-label">
            <input type="checkbox" name="isFeatured" checked={post.isFeatured} onChange={handleChange} />
            {t("createPost.form.featured")}
          </label>

          <label className="cp-checkbox-label">
            <input
              type="checkbox"
              name="isRecommended"
              checked={post.isRecommended}
              onChange={handleChange}
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