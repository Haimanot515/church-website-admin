import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateChurchAssignment.css";

const CreateChurchAssignment = () => {
  const { t } = useTranslation("translation", { keyPrefix: "createChurchAssignment" });

  const [assignment, setAssignment] = useState({
    user: "",
    church: "",
    role: "",
    servingSince: "",
    description: "",
    isPrimary: false,
    image: null,
  });

  const [preview, setPreview] = useState(null);

  const [users, setUsers] = useState([]);
  const [churches, setChurches] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users and churches from the backend on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userRes, churchRes] = await Promise.all([
          API.get("/admin/users?page=1&limit=1000", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/churches"),
        ]);

        setUsers(userRes.data.users); // /admin/users returns { users, totalUsers }
        setChurches(churchRes.data);
      } catch (err) {
        console.log(err);
        setError(t("loadOptionsErrorMessage"));
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, [t]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAssignment({
      ...assignment,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAssignment({ ...assignment, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("user", assignment.user);
      formData.append("church", assignment.church);
      formData.append("role", assignment.role);
      if (assignment.servingSince) {
        formData.append("servingSince", assignment.servingSince);
      }
      formData.append("description", assignment.description);
      formData.append("isCurrent", true);
      formData.append("isPrimary", assignment.isPrimary);

      if (assignment.image) {
        formData.append("image", assignment.image);
      }

      // Matches POST /api/churches/assignment in churchRoutes.js,
      // handled by createAssignment in churchController.js
      await API.post("/churches/assignment", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(t("successMessage"));

      setAssignment({
        user: "",
        church: "",
        role: "",
        servingSince: "",
        description: "",
        isPrimary: false,
        image: null,
      });
      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createChurchAssignment-page">
      <div className="createChurchAssignment-card">
        <h2 className="createChurchAssignment-title">{t("title")}</h2>

        {error && <p className="createChurchAssignment-error">{error}</p>}

        <form onSubmit={handleSubmit} className="createChurchAssignment-form">
          <select
            name="user"
            value={assignment.user}
            onChange={handleChange}
            required
            disabled={optionsLoading}
            className="createChurchAssignment-select"
          >
            <option value="">
              {optionsLoading ? t("loadingUsersMessage") : t("selectUserPlaceholder")}
            </option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name || u.username || u.email}
              </option>
            ))}
          </select>

          <select
            name="church"
            value={assignment.church}
            onChange={handleChange}
            required
            disabled={optionsLoading}
            className="createChurchAssignment-select"
          >
            <option value="">
              {optionsLoading ? t("loadingChurchesMessage") : t("selectChurchPlaceholder")}
            </option>
            {churches.map((c) => (
              <option key={c._id} value={c._id}>
                {c.churchName}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="role"
            placeholder={t("rolePlaceholder")}
            value={assignment.role}
            onChange={handleChange}
            required
            className="createChurchAssignment-input"
          />

          <input
            type="date"
            name="servingSince"
            value={assignment.servingSince}
            onChange={handleChange}
            className="createChurchAssignment-input"
          />

          <textarea
            name="description"
            placeholder={t("descriptionPlaceholder")}
            value={assignment.description}
            onChange={handleChange}
            rows="4"
            className="createChurchAssignment-textarea"
          />

          <div className="createChurchAssignment-fileGroup">
            <label className="createChurchAssignment-fileLabel">{t("leaderPhotoLabel")}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="createChurchAssignment-fileInput"
            />
          </div>

          {preview && (
            <img src={preview} alt={t("imageAlt")} className="createChurchAssignment-preview" />
          )}

          {/* Drives the "Where I Serve Now" section on the public Church
              page (getLeadershipChurch requires isCurrent AND isPrimary).
              Only one assignment across all users can hold this — checking
              it will replace whichever assignment currently holds it. */}
          <label className="createChurchAssignment-checkboxLabel">
            <input
              type="checkbox"
              name="isPrimary"
              checked={assignment.isPrimary}
              onChange={handleChange}
              className="createChurchAssignment-checkbox"
            />
            <span>
              {t("setAsFeaturedLeader")}
              <small className="createChurchAssignment-hint">{t("featuredLeaderHint")}</small>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || optionsLoading}
            className="createChurchAssignment-submitButton"
          >
            {loading ? t("submittingButton") : t("submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChurchAssignment;