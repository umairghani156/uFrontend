import React, { useState } from 'react';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components"
import { loginFailure, loginStart, loginSuccess } from '../redux/userSlice';
import {auth, provider} from "../firebase.js";
import {signInWithPopup} from "firebase/auth"
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const Container = styled.div`
display: flex;
align-items: center;
flex-direction: column;
justify-content: center;
height: calc(100vh - 86px);
color: ${({theme})=> theme.text};
margin-top: 30px;
@media (max-width: 420px) {
   width: 100%;
   padding: 10px;
}
`;

const Wrapper = styled.div`
display: flex;
align-items: center;
flex-direction: column;
background-color: ${({theme})=> theme.bgLighter};
border:1px solid ${({theme})=> theme.soft};
padding: 20px 50px;
gap: 10px;

`;

const Title = styled.h1`
font-size: 24px;
`;

const SubTitle = styled.h2`
font-size: 20px;
font-weight: 300;
`;

const Input = styled.input`
border: 1px solid ${({theme})=> theme.soft};
border-radius: 3px;
padding: 10px;
background-color: transparent;
width: 100%;
color: white;
`;

const Button = styled.button`
border-radius: 3px;
border: none;
padding: 7px 20px;
font-weight: 500;
cursor: pointer;
background-color: ${({theme})=> theme.soft};
color: ${({theme})=> theme.textSoft};
&:hover {
  background-color: #3ea6ff;
  color: black;
}

`;

const More = styled.div`
display: flex;
margin-top: 10px;
font-size: 12px;
font-size: 10px;
color: ${({theme})=> theme.textSoft};

`;

const Links = styled.div`
margin-left: 50px;
`;

const Link = styled.span`
margin-left: 30px;
`;

export const Signin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameLogin, setNameLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch()
 const handleLogin = async (e)=>{
   e.preventDefault();
  // dispatch(loginStart())
   try{
    await axios.post(`https://ubackend-one.vercel.app/api/auth/signin`,{
      name: nameLogin,
      password:passwordLogin,
    },{
      withCredentials: true,
    }).then((res)=>{
      console.log(res.data.token);
      const token = res.data.token;
      localStorage.setItem("dummyToken",token)
      dispatch(loginSuccess(res.data));
      navigate("/")
    })
   }catch(err){
   // dispatch(loginFailure());
    console.log(err);
   }
 } 
 //hello

 const signInWithGoogle = () =>{
  dispatch(loginStart())
  signInWithPopup(auth,provider).then( async(result)=> {
    await axios.post(`https://ubackend-one.vercel.app/api/auth/google`,{
      name: result.user.displayName,
      email: result.user.email,
      img: result.user.photoURL,
    },{
      withCredentials: true,
    }).then((res)=>{
      const token = res.data.token;
      localStorage.setItem("dummyToken",token);
      dispatch(loginSuccess(res.data));
      navigate("/")
    })
  }).catch((error)=>{
    dispatch(loginFailure(error))
   console.log(error);
  })
 }
 const signupHandler = async ()=>{
  try{
    await axios.post(`https://ubackend-one.vercel.app/api/auth/signup`,{
      name,
      email,
      password,
      img: "https://tse1.mm.bing.net/th?id=OIP.1nWRQ7r_1nEVJ6sdz_zwkwHaE8&pid=Api",
    },{
      withCredentials: true,
    }).then((res)=>{
      console.log(res);
      toast.success(`SignUp successful! Now signin to start`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });    
      //dispatch(loginSuccess(res.data))
    })
  }catch(error){
    console.log(error);
   // dispatch(loginFailure(error))
  }
  setName("")
  setEmail("")
  setPassword("")
 }
  return (
    <Container>
     <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
/>
       <Wrapper>
          <Title>Sign in</Title>
          <SubTitle>to continue to GhaniTube</SubTitle>
          <Input placeholder='username' value={nameLogin} onChange={(e)=> setNameLogin(e.target.value)}/>
          <Input type='password' value={passwordLogin} placeholder='password' onChange={(e)=> setPasswordLogin(e.target.value)}/>
          <Button onClick={handleLogin}>Sign in</Button>
          <Button onClick={signInWithGoogle}>Signin with Google</Button>
          <Title>or</Title>
          <Input placeholder='username' value={name} onChange={(e)=> setName(e.target.value)}/>
          <Input type='email' placeholder='email' value={email} onChange={(e)=> setEmail(e.target.value)}/>
          <Input type='password' placeholder='password' value={password} onChange={(e)=> setPassword(e.target.value)}/>
          <Button onClick={signupHandler}>Sign up</Button>
       </Wrapper>
       <More>
        English(USA)
        <Links>
        <Link>
         Help
        </Link>
        <Link>
         Privacy
        </Link>
        <Link>
         Terms
        </Link>
        </Links>
       </More>
    </Container>
  )
}
