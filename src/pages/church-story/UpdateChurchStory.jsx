import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";


const UpdateChurchStory = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState({
    title: "",
    desc: "",
    leader: "",
    leaderRole: "",
    range: "",
    servedBy: "",
    order: 0,
    year: "",
    file: null // new photo, if replaced
  });

  const [existingPhoto, setExistingPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Revoke the preview URL whenever it changes or the component unmounts
  useEffect(() => {

    return () => {

      if (preview) URL.revokeObjectURL(preview);

    };

  }, [preview]);


  // Load the existing chapter so the form is pre-filled
  useEffect(() => {

    const fetchStory = async () => {

      try {

        // Matches GET /api/church-story/:id -> getChurchStoryById
        const res = await API.get(`/church-story/${id}`);
        const s = res.data;

        setStory({
          title: s.title || "",
          desc: s.desc || "",
          leader: s.leader || "",
          leaderRole: s.leaderRole || "",
          range: s.range || "",
          servedBy: s.servedBy || "",
          order: s.order ?? 0,
          year: s.year ?? "",
          file: null
        });

        setExistingPhoto(s.photo || null);

      } catch (err) {

        console.log(err);

        setError(
          err.response?.data?.message ||
          "Failed to load church story chapter"
        );

      } finally {

        setFetching(false);

      }

    };

    fetchStory();

  }, [id]);


  const handleChange = (e) => {

    setStory({
      ...story,
      [e.target.name]: e.target.value
    });

  };


  const handleFileChange = (e) => {

    const selectedFile = e.target.files[0];

    setStory({
      ...story,
      file: selectedFile || null
    });

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }

  };


  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("title", story.title);
      formData.append("desc", story.desc);
      formData.append("leader", story.leader);
      formData.append("leaderRole", story.leaderRole);
      formData.append("range", story.range);
      formData.append("servedBy", story.servedBy);
      formData.append("order", story.order);

      // Only append year if a value was actually entered — sending an
      // empty string can fail schema validation if year is typed as a
      // Number.
      if (story.year) {
        formData.append("year", story.year);
      }

      if (story.file) {
        formData.append("photo", story.file);
      }

      // Auth header is already attached globally by the API interceptor
      // Matches PUT /api/church-story/:id -> updateChurchStory
      await API.put(`/church-story/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Church story chapter updated successfully");

      navigate("/admin/church-story");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to update church story chapter"
      );

    } finally {

      setLoading(false);

    }

  };


  if (fetching) return <p style={{ padding: "30px" }}>Loading chapter...</p>;


  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px"
      }}
    >

      <div
        style={{
          maxWidth: "650px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <h2>Update Church Story Chapter</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >

          <input
            type="text"
            name="title"
            placeholder="Chapter title (e.g. The Founding Years)"
            value={story.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="leader"
            placeholder="Leader name"
            value={story.leader}
            onChange={handleChange}
          />

          <input
            type="text"
            name="leaderRole"
            placeholder="Leader role (e.g. Founding Pastor)"
            value={story.leaderRole}
            onChange={handleChange}
          />

          <input
            type="text"
            name="range"
            placeholder="Years led (e.g. 1998 – 2006)"
            value={story.range}
            onChange={handleChange}
          />

          <input
            type="text"
            name="servedBy"
            placeholder="Served by / community group"
            value={story.servedBy}
            onChange={handleChange}
          />

          <input
            type="number"
            name="order"
            placeholder="Display order (lower = shown first)"
            value={story.order}
            onChange={handleChange}
            min="0"
          />

          <input
            type="number"
            name="year"
            placeholder="Sort year (used for chronological ordering)"
            value={story.year}
            onChange={handleChange}
          />

          <textarea
            name="desc"
            placeholder="Chapter description"
            rows="5"
            value={story.desc}
            onChange={handleChange}
          />

          {existingPhoto && !preview && (
            <div>
              <small style={{ color: "#64748b" }}>Current photo:</small>
              <br />
              <img
                src={existingPhoto}
                alt="current chapter"
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {preview && (
            <div>
              <small style={{ color: "#64748b" }}>New photo:</small>
              <br />
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/church-story")}
              style={{
                padding: "14px",
                background: "#e2e8f0",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  );

};


export default UpdateChurchStory;