import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";


const DeletePromotion = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [promotion, setPromotion] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");


  // There's no GET /promotions/:id route, so we pull it out of the
  // full list to show what's about to be deleted.
  useEffect(() => {

    const fetchPromotion = async () => {

      try {

        const res = await API.get("/promotions");

        const found = res.data.find((p) => p._id === id);

        if (!found) {
          setError("Promotion not found");
          return;
        }

        setPromotion(found);

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


  const handleDelete = async () => {

    try {

      setDeleting(true);
      setError("");

      const token = localStorage.getItem("token");

      // Matches DELETE /api/promotions/:id -> deletePromotion
      await API.delete(`/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Promotion deleted successfully");

      navigate("/admin/promotions");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to delete promotion"
      );

      setDeleting(false);

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
          maxWidth: "550px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <h2>Delete Promotion</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {promotion && (

          <>

            <p style={{ color: "#475569" }}>
              Are you sure you want to delete this promotion? This
              cannot be undone.
            </p>

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                margin: "20px 0",
                display: "flex",
                gap: "14px",
                alignItems: "center"
              }}
            >

              {promotion.photo && (
                <img
                  src={promotion.photo}
                  alt={promotion.title}
                  style={{
                    width: "80px",
                    height: "64px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              )}

              <div>
                <strong>{promotion.title}</strong>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    marginTop: "4px"
                  }}
                >
                  {promotion.description}
                </div>
              </div>

            </div>

            <div style={{ display: "flex", gap: "10px" }}>

              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >
                {deleting ? "Deleting..." : "Delete Promotion"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/promotions")}
                disabled={deleting}
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

          </>

        )}

      </div>

    </div>

  );

};


export default DeletePromotion;