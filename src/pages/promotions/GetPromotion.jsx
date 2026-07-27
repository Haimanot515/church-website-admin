import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";


const GetPromotions = () => {

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();


  const fetchPromotions = async () => {

    try {

      setLoading(true);

      // Matches GET /api/promotions -> getPromotion
      const res = await API.get("/promotions");

      setPromotions(res.data);

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to load promotions"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    fetchPromotions();
  }, []);


  const handleDelete = async (id, title) => {

    const confirmed = window.confirm(
      `Delete promotion "${title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {

      setDeletingId(id);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/promotions/:id -> deletePromotion
      await API.delete(`/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPromotions((prev) =>
        prev.filter((p) => p._id !== id)
      );

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Failed to delete promotion"
      );

    } finally {

      setDeletingId(null);

    }

  };


  if (loading) return <p style={{ padding: "30px" }}>Loading promotions...</p>;


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
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >

          <h2 style={{ margin: 0 }}>Promotions</h2>

          <button
            onClick={() => navigate("/admin/promotions/new")}
            style={{
              padding: "10px 16px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            + New Promotion
          </button>

        </div>


        {error && <p style={{ color: "red" }}>{error}</p>}

        {promotions.length === 0 && !error && <p>No promotions yet.</p>}


        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {promotions.map((p) => (

            <div
              key={p._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px"
              }}
            >

              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

                {p.photo && (
                  <img
                    src={p.photo}
                    alt={p.title}
                    style={{
                      width: "70px",
                      height: "56px",
                      objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />
                )}

                <div>
                  <strong>{p.title}</strong>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      maxWidth: "480px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {p.description}
                  </div>
                </div>

              </div>


              <div style={{ display: "flex", gap: "8px" }}>

                <button
                  onClick={() => navigate(`/admin/promotions/${p._id}/edit`)}
                  style={{
                    padding: "8px 14px",
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(p._id, p.title)}
                  disabled={deletingId === p._id}
                  style={{
                    padding: "8px 14px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  {deletingId === p._id ? "Deleting..." : "Delete"}
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};


export default GetPromotions;