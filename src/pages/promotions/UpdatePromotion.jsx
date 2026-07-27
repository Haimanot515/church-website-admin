import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";


const UpdatePromotion = () => {

  const { id } = useParams();
  const navigate = useNavigate();


  const [promotion, setPromotion] = useState({
    title: "",
    description: "",
    photo: null // new file, if replaced
  });


  const [existingPhoto, setExistingPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Load the existing promotion so the form is pre-filled.
  // There's no GET /promotions/:id route, so we pull it out of the
  // full list instead.
  useEffect(() => {

    const fetchPromotion = async () => {

      try {

        const res = await API.get("/promotions");

        const found = res.data.find((p) => p._id === id);

        if (!found) {
          setError("Promotion not found");
          return;
        }

        setPromotion({
          title: found.title || "",
          description: found.description || "",
          photo: null
        });

        setExistingPhoto(found.photo || null);

      } catch (err) {

        console.log(err);

        setError(
          err.response?.data?.message ||
          "Failed to load promotion"
        );

      } finally {

        setFetching(false);

      }

    };

    fetchPromotion();

  }, [id]);


  const handleChange = (e) => {

    const { name, value } = e.target;

    setPromotion({
      ...promotion,
      [name]: value
    });

  };


  const handleFileChange = (e) => {

    const file = e.target.files[0];

    setPromotion({
      ...promotion,
      photo: file
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

      formData.append("title", promotion.title);
      formData.append("description", promotion.description);

      // Only send a new photo if the admin picked one; otherwise the
      // controller keeps the existing photo (it only overwrites when
      // req.file is present).
      if (promotion.photo) {
        formData.append("photo", promotion.photo);
      }

      const token = localStorage.getItem("token");

      // Matches PUT /api/promotions/:id -> updatePromotion
      await API.put(`/promotions/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Promotion updated successfully");

      navigate("/admin/promotions");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to update promotion"
      );

    } finally {

      setLoading(false);

    }

  };


  if (fetching) return <p style={{ padding: "30px" }}>Loading promotion...</p>;


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

        <h2>Update Promotion</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >

          <input
            type="text"
            name="title"
            placeholder="Drive Your Business Forward with Industry-Leading Insights"
            value={promotion.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Unlock exclusive strategies and data-driven reports designed to give you a competitive edge in 2026."
            rows="6"
            value={promotion.description}
            onChange={handleChange}
            required
          />

          {existingPhoto && !preview && (
            <div>
              <small style={{ color: "#64748b" }}>Current photo:</small>
              <img
                src={existingPhoto}
                alt="current promotion"
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
              <small style={{ color: "#64748b" }}>New photo:</small>
              <img
                src={preview}
                alt="promotion preview"
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
                background: "#16a34a",
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
              onClick={() => navigate("/admin/promotions")}
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


export default UpdatePromotion;