import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext=createContext()
function UserContext({children}) {
    const serverUrl = "http://localhost:8000"
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    const handleCurrentUser = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
            setUserData(result.data)
            console.log(result.data)
        } catch (error) {
            console.log(error)
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }

    const getAiResponse = async (command, history = [], image = null) => {
        try {
            const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, { command, history, image }, { withCredentials: true })
            return result.data
        } catch (error) {
            console.log("Error in getAiResponse:", error)
            return error.response?.data || {
                type: "general",
                userInput: command,
                response: "Sorry, I am having trouble connecting right now. Please try again."
            }
        }
    }

    useEffect(() => {
        handleCurrentUser()
    }, [])

    const value = {
        serverUrl,
        userData,
        setUserData,
        loading,
        backendImage,
        setBackendImage,
        frontendImage,
        setFrontendImage,
        selectedImage,
        setSelectedImage,
        getAiResponse
    }
  return (
    <div>
    <userDataContext.Provider value={value}>
      {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
