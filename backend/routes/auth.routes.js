import express from "express"
import { Login, logOut, signUp, forgotPassword, resetPassword } from "../controllers/auth.controllers.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",Login)
authRouter.get("/logout",logOut)
authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password/:token", resetPassword)
export default authRouter