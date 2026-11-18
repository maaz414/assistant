import mongoose from "mongoose"
import dns from "node:dns"

// Set public DNS servers (Google & Cloudflare) to resolve MongoDB Atlas SRV records
// Prevents querySrv ECONNREFUSED on networks/hotspots with non-standard local DNS resolvers
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"])
} catch (e) {
  // Ignore if not supported
}

const connectDb = async () => {
  const mongoUrl = process.env.MONGODB_URL
  if (!mongoUrl) {
    throw new Error("MONGODB_URL is missing. Set it in backend/.env before starting the server.")
  }

  await mongoose.connect(mongoUrl)
  console.log("MongoDB connected")
}

export default connectDb
