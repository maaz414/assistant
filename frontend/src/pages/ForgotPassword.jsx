import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function ForgotPassword() {
  const {serverUrl}=useContext(userDataContext)
  const navigate=useNavigate()
  const [email,setEmail]=useState("")
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState("")
  const [msg,setMsg]=useState("")

  const handleForgot=async (e)=>{
    e.preventDefault()
    setErr("")
    setMsg("")
    setLoading(true)
    try {
      let result=await axios.post(`${serverUrl}/api/auth/forgot-password`,{email})
      setMsg(result.data.message)
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "An error occurred")
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.95) 100%), url(${bg})`}} >
      <form className='w-[90%] h-[450px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleForgot}>
        <h1 className='text-white text-[30px] font-semibold mb-[5px] text-center'>Forgot <span className='text-blue-400'>Password</span></h1>
        <p className='text-gray-300 text-[15px] text-center mb-[15px]'>Enter your email address and we will send you a link to reset your password.</p>
        
        <input type="email" placeholder='Email' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
        
        {err.length>0 && <p className='text-red-500 text-[17px]'>*{err}</p>}
        {msg.length>0 && <p className='text-green-400 text-[17px]'>{msg}</p>}

        <button className='min-w-[150px] px-[30px] h-[60px] mt-[10px] text-black font-semibold bg-white rounded-full text-[19px]' disabled={loading}>{loading?"Sending...":"Send Reset Link"}</button>

        <p className='text-[white] text-[18px] cursor-pointer mt-[10px]' onClick={()=>navigate("/signin")}>Back to <span className='text-blue-400'>Sign In</span></p>
      </form>
    </div>
  )
}

export default ForgotPassword
