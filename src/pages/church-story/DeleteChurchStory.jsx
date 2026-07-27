import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";


const DeleteChurchStory = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {

    const fetchStory = async () => {

      try {

        // Matches GET /api/church-story/:id -> getChurchStoryById
        const res = await API.get(`/church-story/${id}`);
        setStory(res.data);

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


  const handleDelete = async () => {

    try {

      setDeleting(true);
      setError("");

      // Auth header is already attached globally by the API interceptor
      // Matches DELETE /api/church-story/:id -> deleteChurchStory
      await API.delete(`/church-story/${id}`);

      alert("Church story chapter deleted successfully");

      navigate("/admin/church-story");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to delete church story chapter"
      );

      setDeleting(false);

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
          maxWidth: "550px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <h2>Delete Church Story Chapter</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {story && (

          <>

            <p style={{ color: "#475569" }}>
              Are you sure you want to delete this chapter? This cannot
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

              {story.photo && (
                <img
                  src={story.photo}
                  alt={story.title}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              )}

              <div>
                <strong>{story.title}</strong>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    marginTop: "4px"
                  }}
                >
                  {story.leader && (
                    <>
                      {story.leader}
                      {story.leaderRole ? ` — ${story.leaderRole}` : ""}
                      {story.range ? ` (${story.range})` : ""}
                    </>
                  )}
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
                {deleting ? "Deleting..." : "Delete Chapter"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/church-story")}
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


export default DeleteChurchStory;