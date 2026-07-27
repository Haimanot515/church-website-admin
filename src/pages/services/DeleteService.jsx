import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";


const DeleteService = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");


  useEffect(() => {

    const fetchService = async () => {

      try {

        // Matches GET /api/services/:id -> getServiceById
        const res = await API.get(`/services/${id}`);
        setService(res.data);

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


  const handleDelete = async () => {

    try {

      setDeleting(true);
      setError("");

      // Matches DELETE /api/services/:id -> deleteService
      await API.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Service deleted successfully");

      navigate("/admin/services");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to delete service"
      );

      setDeleting(false);

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
          maxWidth: "550px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <h2>Delete Service</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {service && (

          <>

            <p style={{ color: "#475569" }}>
              Are you sure you want to delete this service? This cannot
              be undone.
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

              {service.imageUrl && (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  style={{
                    width: "80px",
                    height: "64px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              )}

              <div>
                <strong>{service.title}</strong>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    marginTop: "4px"
                  }}
                >
                  {service.day} · {service.time} · {service.category}
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
                {deleting ? "Deleting..." : "Delete Service"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/services")}
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


export default DeleteService;