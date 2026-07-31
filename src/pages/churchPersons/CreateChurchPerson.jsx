import React, { useState, useEffect } from "react";
import API from "../../api/api";


const ROLE_OPTIONS = [
  "",
  "Founding Pastor",
  "Senior Pastor",
  "Associate Pastor",
  "Church Elder",
  "Ministry Assistant",
  "Worship Leader",
  "Small Group Leader",
  "Food Pantry Volunteer",
  "Worship Team Member",
  "Sunday School Teacher",
  "Choir Member",
  "Usher",
  "Treasurer",
  "Secretary",
  "Member"
];


const CreateChurchPerson = () => {


  const [person,setPerson] = useState({

    name:"",
    title:"",
    description:"",
    role:"",
    message:"",
    category:"leader",
    rank:"",
    rankOrder:0,
    language:"",
    files:[]

  });



  const [languages,setLanguages] = useState([]);

  const [previews,setPreviews] = useState([]);

  const [error,setError] = useState("");

  const [loading,setLoading] = useState(false);



  // Revoke previous preview URLs whenever they change or the component unmounts
  useEffect(() => {

    return () => {

      previews.forEach((url) => URL.revokeObjectURL(url));

    };

  }, [previews]);



  // Fetch available languages so the entry can be tied to one
  useEffect(() => {

    const fetchLanguages = async () => {

      try {

        const res = await API.get("/languages");

        setLanguages(res.data || []);

        if (res.data?.length) {

          setPerson((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));

        }

      } catch (err) {

        console.log(err);

      }

    };

    fetchLanguages();

  }, []);





  const handleChange=(e)=>{


    setPerson({

      ...person,

      [e.target.name]:e.target.value

    });


  };







  const handleFileChange=(e)=>{


    const selectedFiles=Array.from(e.target.files);


    setPerson({

      ...person,

      files:selectedFiles

    });



    if(selectedFiles.length > 0){

      setPreviews(
        selectedFiles.map((f) => URL.createObjectURL(f))
      );

    } else {

      setPreviews([]);

    }


  };








  const handleSubmit=async(e)=>{


    e.preventDefault();

    setError("");


    if(!person.language){

      setError("Please select a language");

      return;

    }


    try{


      setLoading(true);



      const formData=new FormData();



      formData.append(
        "name",
        person.name
      );



      formData.append(
        "title",
        person.title
      );



      formData.append(
        "description",
        person.description
      );



      formData.append(
        "role",
        person.role
      );



      formData.append(
        "message",
        person.message
      );



      formData.append(
        "category",
        person.category
      );



      // Only append rank if a value was actually selected — sending an empty
      // string fails the backend's enum validator, since "" isn't a valid rank.
      if(person.rank){

        formData.append(
          "rank",
          person.rank
        );

      }



      formData.append(
        "rankOrder",
        person.rankOrder
      );



      formData.append(
        "language",
        person.language
      );



      if(person.files && person.files.length > 0){

        person.files.forEach((file) => {

          formData.append(
            "photos",
            file
          );

        });

      }



      // Auth header is already attached globally by the API interceptor
      await API.post(

        "/church-persons",

        formData,

        {

          headers:{

            "Content-Type":
            "multipart/form-data"

          }

        }

      );





      alert(
        "Church person created successfully"
      );





      setPerson({

        name:"",
        title:"",
        description:"",
        role:"",
        message:"",
        category:"leader",
        rank:"",
        rankOrder:0,
        language: languages[0]?._id || "",
        files:[]

      });



      setPreviews([]);



    }
    catch(err){


      console.log(err);


      setError(

        err.response?.data?.message ||

        "Failed to create church person"

      );


    }
    finally{


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
Create Church Person
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





<input

type="text"

name="name"

placeholder="Full name"

value={person.name}

onChange={handleChange}

required

/>







<select

name="language"

value={person.language}

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







<select

name="category"

value={person.category}

onChange={handleChange}

>



<option value="leader">

Leader

</option>



<option value="specialThanks">

Special Thanks

</option>



<option value="testimony">

Testimony

</option>



</select>







<input

type="text"

name="title"

placeholder="Title (e.g. Associate Pastor, Small Group Leader)"

value={person.title}

onChange={handleChange}

/>







<select

name="role"

value={person.role}

onChange={handleChange}

>



{ROLE_OPTIONS.map((opt) => (

<option key={opt} value={opt}>

{opt === "" ? "Select Role" : opt}

</option>

))}



</select>







<select

name="rank"

value={person.rank}

onChange={handleChange}

>



<option value="">

No Rank

</option>



<option value="patriarch">

Patriarch

</option>



<option value="archbishop">

Archbishop

</option>



<option value="bishop">

Bishop

</option>



<option value="archpriest">

Archpriest

</option>



<option value="priest">

Priest

</option>



<option value="deacon">

Deacon

</option>



<option value="subdeacon">

Subdeacon

</option>



<option value="elder">

Elder

</option>



<option value="member">

Member

</option>



</select>







<input

type="number"

name="rankOrder"

placeholder="Rank order (lower = higher precedence)"

value={person.rankOrder}

onChange={handleChange}

min="0"

/>







<textarea

name="description"

placeholder="Short bio or description"

rows="4"

value={person.description}

onChange={handleChange}

/>







<textarea

name="message"

placeholder="Message / testimony quote (used for testimonies)"

rows="4"

value={person.message}

onChange={handleChange}

/>







<input

type="file"

accept="image/*"

multiple

onChange={handleFileChange}

/>








{
previews.length > 0 &&

<div

style={{

display:"flex",

flexWrap:"wrap",

gap:"10px"

}}

>

{previews.map((src, i) => (

<img

key={i}

src={src}

alt={`preview-${i}`}

style={{

width:"100px",

height:"100px",

objectFit:"cover",

borderRadius:"10px",

border:"1px solid #e2e8f0"

}}

/>

))}

</div>

}







<button

type="submit"

disabled={loading}

style={{

padding:"14px",

background:"#2563eb",

color:"#fff",

border:"none",

borderRadius:"10px",

cursor:"pointer"

}}

>


{
loading
?
"Saving..."
:
"Create Church Person"
}


</button>





</form>


</div>


</div>


);


};


export default CreateChurchPerson;