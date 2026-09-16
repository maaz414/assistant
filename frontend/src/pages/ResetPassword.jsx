import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function ResetPassword() {
  const [showPassword,setShowPassword]=useState(false)
  const {serverUrl}=useContext(userDataContext)
  const navigate=useNavigate()
  const { token } = useParams()
  
  const [password,setPassword]=useState("")
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState("")
  const [msg,setMsg]=useState("")

  const handleReset=async (e)=>{
    e.preventDefault()
    setErr("")
    setMsg("")
    setLoading(true)
    try {
      let result=await axios.post(`${serverUrl}/api/auth/reset-password/${token}`,{password})
      setMsg(result.data.message)
      setLoading(false)
      setTimeout(() => {
        navigate("/signin")
      }, 2000)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setErr(error.response?.data?.message || "An error occurred")
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.95) 100%), url(${bg})`}} >
      <form className='w-[90%] h-[500px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleReset}>
        <h1 className='text-white text-[30px] font-semibold mb-[20px] text-center'>Set New <span className='text-blue-400'>Password</span></h1>
        
        <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
          <input type={showPassword?"text":"password"} placeholder='Enter new password' className='w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]' required onChange={(e)=>setPassword(e.target.value)} value={password}/>
          {!showPassword && <IoEye className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer' onClick={()=>setShowPassword(true)}/>}
          {showPassword && <IoEyeOff className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer' onClick={()=>setShowPassword(false)}/>}
        </div>

        {err.length>0 && <p className='text-red-500 text-[17px]'>*{err}</p>}
        {msg.length>0 && <p className='text-green-400 text-[17px]'>{msg}</p>}

        <button className='min-w-[150px] px-[30px] h-[60px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px]' disabled={loading}>{loading?"Saving...":"Set Password"}</button>

        <p className='text-[white] text-[18px] cursor-pointer mt-[20px]' onClick={()=>navigate("/signin")}>Back to <span className='text-blue-400'>Sign In</span></p>
      </form>
    </div>
  )
}

export default ResetPassword
