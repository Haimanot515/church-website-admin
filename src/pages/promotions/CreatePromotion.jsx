import React, { useState } from "react";
import axios from "axios";

const CreatePromotion = () => {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const handlePhotoChange = (e) => {

    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setPhoto(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if(photo){
        formData.append("photo", photo);
      }


      const res = await axios.post(
        "http://localhost:5000/api/promotions",
        formData,
        {
          withCredentials:true,
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );


      console.log(res.data);

      setMessage("Promotion created successfully ✅");

      setTitle("");
      setDescription("");
      setPhoto(null);
      setPreview("");


    } catch(error){

      console.log(error);

      setMessage(
        error.response?.data?.message ||
        "Failed to create promotion"
      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <>

    <style>{`

      .create-promotion-page {
        min-height: 100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:40px;
        background:#f8fafc;
        font-family:Arial, sans-serif;
      }


      .promotion-card {
        width:100%;
        max-width:650px;
        background:white;
        padding:35px;
        border-radius:12px;
        box-shadow:0 10px 30px rgba(0,0,0,0.08);
      }


      .promotion-card h2 {
        text-align:center;
        margin-bottom:25px;
        color:#1e293b;
      }


      .promotion-message {
        padding:12px;
        margin-bottom:20px;
        text-align:center;
        border-radius:8px;
        background:#dcfce7;
        color:#166534;
        font-weight:bold;
      }


      .form-group {
        margin-bottom:20px;
      }


      .form-group label {
        display:block;
        margin-bottom:8px;
        font-weight:600;
        color:#334155;
      }


      .form-group input,
      .form-group textarea {

        width:100%;
        padding:12px;
        border:1px solid #cbd5e1;
        border-radius:8px;
        font-size:15px;
        box-sizing:border-box;
      }


      .form-group textarea {
        resize:vertical;
      }


      .form-group input:focus,
      .form-group textarea:focus {

        outline:none;
        border-color:#16a34a;

      }


      .image-preview {

        display:flex;
        justify-content:center;
        margin:20px 0;

      }


      .image-preview img {

        width:300px;
        height:200px;
        object-fit:cover;
        border-radius:10px;

      }


      .promotion-card button {

        width:100%;
        padding:14px;
        border:none;
        border-radius:8px;
        background:#16a34a;
        color:white;
        font-size:16px;
        font-weight:bold;
        cursor:pointer;

      }


      .promotion-card button:hover {

        background:#15803d;

      }


      .promotion-card button:disabled {

        background:#94a3b8;
        cursor:not-allowed;

      }


      @media(max-width:700px){

        .create-promotion-page{

          padding:20px;

        }


        .promotion-card{

          padding:20px;

        }


        .image-preview img{

          width:100%;
          height:auto;

        }

      }

    `}</style>



    <div className="create-promotion-page">


      <div className="promotion-card">


        <h2>
          Create Promotion
        </h2>



        {message && (

          <div className="promotion-message">
            {message}
          </div>

        )}



        <form onSubmit={handleSubmit}>


          <div className="form-group">

            <label>
              Promotion Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              placeholder="Drive Your Business Forward with Industry-Leading Insights"
              required
            />

          </div>



          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              placeholder="Unlock exclusive strategies and data-driven reports designed to give you a competitive edge in 2026."
              rows="6"
              required
            />

          </div>



          <div className="form-group">

            <label>
              Promotion Photo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

          </div>




          {preview && (

            <div className="image-preview">

              <img
                src={preview}
                alt="preview"
              />

            </div>

          )}




          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
              ? "Creating..."
              : "Create Promotion"
            }

          </button>



        </form>


      </div>


    </div>


    </>

  );

};


export default CreatePromotion;