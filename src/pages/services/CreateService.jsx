import React, { useState, useEffect } from "react";
import API from "../../api/api";


const CreateService = () => {


  const [service, setService] = useState({

    title: "",
    description: "",
    day: "",
    time: "",
    category: "Other",
    language: "",
    location: "",
    isFeatured: false,
    image: null

  });


  const [languages, setLanguages] = useState([]);

  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


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


  // Fetch available languages so the entry can be tied to one
  useEffect(() => {

    const fetchLanguages = async () => {

      try {

        const res = await API.get("/languages");

        setLanguages(res.data || []);

        if (res.data?.length) {

          setService((prev) => ({
            ...prev,
            language: prev.language || res.data[0]._id
          }));

        }

      } catch (err) {

        console.log(err);

      }

    };

    fetchLanguages();

  }, []);


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

      setPreview(
        URL.createObjectURL(file)
      );

    }


  };


  const handleSubmit = async (e) => {


    e.preventDefault();

    setError("");

    if (!service.language) {

      setError("Please select a language");

      return;

    }


    try {


      setLoading(true);



      const token =
        localStorage.getItem("token");



      const formData = new FormData();



      formData.append(
        "title",
        service.title
      );



      formData.append(
        "description",
        service.description
      );



      formData.append(
        "day",
        service.day
      );



      formData.append(
        "time",
        service.time
      );



      formData.append(
        "category",
        service.category
      );



      formData.append(
        "language",
        service.language
      );



      formData.append(
        "location",
        service.location
      );



      formData.append(
        "isFeatured",
        service.isFeatured
      );



      if (service.image) {

        formData.append(
          "image",
          service.image
        );

      }



      await API.post(

        "/services",

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
        "Service created successfully"
      );



      setService({

        title: "",
        description: "",
        day: "",
        time: "",
        category: "Other",
        language: languages[0]?._id || "",
        location: "",
        isFeatured: false,
        image: null

      });



      setPreview(null);



    }
    catch (err) {


      console.log(err);


      setError(

        err.response?.data?.message ||

        "Failed to create service"

      );


    }
    finally {


      setLoading(false);


    }



  };


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


        <h2>
          Create Church Service
        </h2>



        {
          error &&

          <p style={{ color: "red" }}>
            {error}
          </p>

        }



        <form

          onSubmit={handleSubmit}

          style={{

            display: "flex",

            flexDirection: "column",

            gap: "15px"

          }}

        >


          <select

            name="language"

            value={service.language}

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


          <input

            type="file"

            accept="image/*"

            onChange={handleFileChange}

          />


          {
            preview &&

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

          }


          <button

            type="submit"

            disabled={loading}

            style={{

              padding: "14px",

              background: "#2563eb",

              color: "#fff",

              border: "none",

              borderRadius: "10px",

              cursor: "pointer"

            }}

          >


            {
              loading
                ? "Creating..."
                : "Create Service"
            }


          </button>


        </form>



      </div>


    </div>


  );


};


export default CreateService;