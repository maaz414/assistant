import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"


const app = express()

// Trust reverse proxy for secure cookies on Render/Railway/Heroku
app.set("trust proxy", 1)

// Dynamic CORS configuration
const allowedOrigins = [
  "https://assistant-1-95ab.onrender.com",
  "https://assistant-1-95ab.onrender.com",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(url => url.trim().replace(/\/$/, "")) : [])
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const isAllowed = allowedOrigins.includes(origin) || 
                      process.env.NODE_ENV !== "production" ||
                      origin.endsWith(".vercel.app")
    if (isAllowed) {
      return callback(null, true)
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))

const port = process.env.PORT || 8000
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

// Health check endpoints for cloud monitoring
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Virtual Assistant API is running" })
})

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() })
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

const startServer = async () => {
  try {
    await connectDb()
    app.listen(port, () => {
      console.log(`Server started on port ${port}`)
    })
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

startServer()

