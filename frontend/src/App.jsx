import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
function App() {
  const { userData, setUserData, loading } = useContext(userDataContext)

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#02021c] flex flex-col justify-center items-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-300 font-medium tracking-wider text-sm">Loading assistant...</p>
      </div>
    )
  }

  return (
   <Routes>
     <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
    <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
     <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
     <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
     <Route path='/reset-password/:token' element={!userData?<ResetPassword/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
       <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
   </Routes>
  )
}

export default App
