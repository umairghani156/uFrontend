import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "../firebase";
import axios from "axios";
import {useNavigate} from "react-router-dom"
import { useSelector } from 'react-redux';
const Container = styled.div`
width: 100%;
height: 100%;
position: absolute;
top: 0;
left: 0;
right: 0;
background-color: #000000a7;
display: flex;
align-items: center;
justify-content: center;
z-index: 1;
@media (max-width: 478px) {
width: 100%;
 z-index: 1;
 
}

`;
const Wrapper = styled.div`
width: 600px;
height: 540px;
background-color: ${({theme})=> theme.bgLighter};
color: ${({theme})=> theme.text};
padding: 20px;
display: flex;
flex-direction: column;
gap: 20px;
position: relative;
@media (max-width: 478px) {
 height: 100%;
 width: 100%;
 z-index: 1;
 
 
}
`;
const Close = styled.div`
position: absolute;
top: 10px;
right: 10px;
cursor: pointer;
`;
const Title = styled.h1`
text-align: center;

`;


const Desc = styled.textarea`
border:1px solid ${({theme})=> theme.soft};
color: ${({theme})=> theme.text};
border-radius: 4px;
padding: 10px;
background-color: transparent;


`;
const Input = styled.input`
border:1px solid ${({theme})=> theme.soft};
color: ${({theme})=> theme.text};
border-radius: 4px;
padding: 10px;
background-color: transparent;
`;

const Button = styled.button`
border-radius: 3px;
border: none;
padding: 10px 20px;
font-weight: 500;
cursor: pointer;
background-color:${({theme})=> theme.soft};
color: ${({theme})=> theme.textSoft};

`;
const Label = styled.label`
font-size: 14px;
`;
export const Upload = ({setOpenModal}) => {
  const {currentUser} = useSelector(state => state.user);

  const [img, setImg] = useState(undefined);
  const [video, setVideo] = useState(undefined);
  const [imgPerc, setImgPerc] = useState(0);
  const [videoPerc, setVideoPerc] = useState(0);
  const [inputs, setInputs] = useState({});
  const [tags, setTags] = useState([]);
  const navigate = useNavigate()

  const handleChange = (e) =>{
    setInputs((prev)=>{
      return {...prev, [e.target.name]: e.target.value}
    })
  }

  const handleTags =(e)=> {
    setTags(e.target.value.split(","))
  };
  //Upload video and Images 
  const uploadFile = (file, urlType)=>{
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file?.name;
    const storageRef = ref(storage, fileName);
    console.log("file",file);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
  (snapshot) => {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    urlType === "imgUrl" ? setImgPerc(Math.round(progress)) : setVideoPerc(Math.round(progress));
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
      default:
        break;
    }
  }, 
  (error) => {},
  () => {
    // Upload completed successfully, now we can get the download URL
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      setInputs((prev)=>{
        return {...prev, [urlType]: downloadURL}
      })
    });
  }
)
  };
  useEffect(()=>{
   video && uploadFile(video, "videoUrl")
  },[video]);
  useEffect(()=>{
  img &&  uploadFile(img, "imgUrl")
  },[img]);

  // Upload a Video
  const uploadVideoHandler = async (e) => {
    const token = localStorage.getItem("dummyToken");
    e.preventDefault();
    const res = await axios.post(`https://ubackend-one.vercel.app/api/videos`, {...inputs,userImg:currentUser?.img , tags}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true // Ensure cookies are sent with the request
  });
    console.log("res", res);
   setOpenModal(false);
   res.status === 200 && navigate(`/video/${res.data._id}`);
  }
  return (
    <Container>
        <Wrapper>
            <Close onClick={()=> setOpenModal(false)}>X</Close>
            <Title>Upload a New Video</Title>
            <Label>Video:</Label>
            {
              videoPerc > 0 ?
              (
                "Uploading:" + videoPerc + "%"
              )
              :
               (<Input  type='file' accept='video/mp4,video/mpeg,video/quicktime' onChange={(e)=> {setVideo(e.target.files[0])
              console.log('file', e.target.files[0]);}}/>)
            }
            <Input type='text' placeholder='Title' name='title' onChange={handleChange}/>
            <Desc placeholder='Description' rows={8} name='desc'  onChange={handleChange}/>
            <Input type='text' placeholder='Separate the tags with commas.'  onChange={handleTags}/>
            <Label>Image:</Label>
            {
              imgPerc > 0 ?
              (
                "Uploading:" + imgPerc + "%"
              )
              :
            (<Input type='file' accept='image/*' onChange={(e)=> setImg(e.target.files[0])}/>)}

            <Button onClick={uploadVideoHandler}>Upload</Button>
            
        </Wrapper>
    </Container>
  )
}
