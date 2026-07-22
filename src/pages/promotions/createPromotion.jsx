import React, { useState } from "react";
import axios from "axios";

const CreatePromotion = () => {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");



  // Image selection
  const handlePhotoChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setPhoto(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };



  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);

      if (photo) {
        formData.append("photo", photo);
      }



      const res = await axios.post(
        "http://localhost:5000/api/promotions",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );



      console.log(res.data);

      setMessage("Promotion created successfully ✅");


      // Clear form after success
      setTitle("");
      setDescription("");
      setPhoto(null);
      setPreview("");



    } catch (error) {

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





          {
            preview && (

              <div className="image-preview">

                <img
                  src={preview}
                  alt="promotion preview"
                />

              </div>

            )
          }





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

  );
};



export default CreatePromotion;