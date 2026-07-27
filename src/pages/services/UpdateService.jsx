import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";


const UpdateService = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState({
    title: "",
    description: "",
    day: "",
    time: "",
    category: "Other",
    location: "",
    isFeatured: false,
    image: null // new file, if replaced
  });

  const [existingImage, setExistingImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Worship",
    "Teaching",
    "Prayer",
    "Music",
    "Youth",
    "Ministry",
    "Outreach",
    "Other"
  ];

  const token = localStorage.getItem("token");


  // Load the existing service so the form is pre-filled
  useEffect(() => {

    const fetchService = async () => {

      try {

        // Matches GET /api/services/:id -> getServiceById
        const res = await API.get(`/services/${id}`);
        const s = res.data;

        setService({
          title: s.title || "",
          description: s.description || "",
          day: s.day || "",
          time: s.time || "",
          category: s.category || "Other",
          location: s.location || "",
          isFeatured: !!s.isFeatured,
          image: null
        });

        setExistingImage(s.imageUrl || null);

      } catch (err) {

        console.log(err);

        setError(
          err.response?.data?.message ||
          "Failed to load service"
        );

      } finally {

        setFetching(false);

      }

    };

    fetchService();

  }, [id]);


  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setService({
      ...service,
      [name]: type === "checkbox" ? checked : value
    });

  };


  const handleFileChange = (e) => {

    const file = e.target.files[0];

    setService({
      ...service,
      image: file
    });

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

      formData.append("title", service.title);
      formData.append("description", service.description);
      formData.append("day", service.day);
      formData.append("time", service.time);
      formData.append("category", service.category);
      formData.append("location", service.location);
      formData.append("isFeatured", service.isFeatured);

      // Only send a new image if the admin picked one; otherwise the
      // controller keeps the existing imageUrl (it only overwrites when
      // req.file is present).
      if (service.image) {
        formData.append("image", service.image);
      }

      // Matches PUT /api/services/:id -> updateService
      await API.put(`/services/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Service updated successfully");

      navigate("/admin/services");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to update service"
      );

    } finally {

      setLoading(false);

    }

  };


  if (fetching) return <p style={{ padding: "30px" }}>Loading service...</p>;


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

        <h2>Update Church Service</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >

          <input
            type="text"
            name="title"
            placeholder="Service title"
            value={service.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Service description"
            rows="5"
            value={service.description}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="day"
            placeholder="Example: Sundays & Feast Days"
            value={service.day}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="time"
            placeholder="Example: 6:00 - 9:00 AM"
            value={service.time}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={service.category}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="location"
            placeholder="Location (e.g. Main Hall)"
            value={service.location}
            onChange={handleChange}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <input
              type="checkbox"
              name="isFeatured"
              checked={service.isFeatured}
              onChange={handleChange}
            />
            Mark as Featured
          </label>

          {existingImage && !preview && (
            <div>
              <small style={{ color: "#64748b" }}>Current image:</small>
              <img
                src={existingImage}
                alt="current service"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px"
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
              <small style={{ color: "#64748b" }}>New image:</small>
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: "10px"
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
              onClick={() => navigate("/admin/services")}
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


export default UpdateService;