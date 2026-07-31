import React, { useState, useEffect } from "react";
import API from "../../api/api";


const CreatePromotion = () => {

  const [promotion, setPromotion] = useState({
    title: "",
    description: "",
    language: "",
    photo: null
  });


  const [languages, setLanguages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // Fetch available languages so the entry can be tied to one
  useEffect(() => {

    const fetchLanguages = async () => {

      try {

        const res = await API.get("/languages");

        setLanguages(res.data || []);

        if (res.data?.length) {

          setPromotion((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));

        }

      } catch (err) {

        console.log(err);

      }

    };

    fetchLanguages();

  }, []);



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


    if(file){

      setPreview(
        URL.createObjectURL(file)
      );

    }

  };




  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    if(!promotion.language){

      setError("Please select a language");

      return;

    }


    try {

      setLoading(true);

      const token = localStorage.getItem("token");


      const formData = new FormData();


      formData.append(
        "title",
        promotion.title
      );


      formData.append(
        "description",
        promotion.description
      );


      formData.append(
        "language",
        promotion.language
      );



      if(promotion.photo){

        formData.append(
          "photo",
          promotion.photo
        );

      }




      await API.post(

        "/promotions",

        formData,

        {

          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "multipart/form-data"

          }

        }

      );



      alert(
        "Promotion created successfully"
      );



      setPromotion({

        title:"",
        description:"",
        language: languages[0]?._id || "",
        photo:null

      });


      setPreview(null);



    } catch(error){


      console.log(error);


      setError(

        error.response?.data?.message ||

        "Failed to create promotion"

      );


    } finally {


      setLoading(false);


    }


  };




  return (

    <div
      style={{
        minHeight:"100vh",
        background:"#f1f5f9",
        padding:"30px"
      }}
    >


      <div
        style={{
          maxWidth:"650px",
          margin:"auto",
          background:"#fff",
          padding:"30px",
          borderRadius:"15px",
          boxShadow:"0 10px 30px rgba(0,0,0,.1)"
        }}
      >


        <h2>
          Create Promotion
        </h2>



        {
          error &&

          <p style={{color:"red"}}>
            {error}
          </p>

        }



        <form
          onSubmit={handleSubmit}
          style={{
            display:"flex",
            flexDirection:"column",
            gap:"15px"
          }}
        >



          <select

            name="language"

            value={promotion.language}

            onChange={handleChange}

            required

          >



            <option value="" disabled>

              Select language

            </option>



            {languages.map((lang) => (

              <option key={lang._id} value={lang._id}>

                {lang.name} ({lang.code})

              </option>

            ))}



          </select>




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





          <input

            type="file"

            accept="image/*"

            onChange={handleFileChange}

          />





          {
            preview &&

            <img

              src={preview}

              alt="promotion preview"

              style={{

                width:"100%",

                height:"250px",

                objectFit:"cover",

                borderRadius:"10px"

              }}

            />

          }





          <button

            type="submit"

            disabled={loading}

            style={{

              padding:"14px",

              background:"#16a34a",

              color:"#fff",

              border:"none",

              borderRadius:"10px",

              cursor:"pointer"

            }}

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