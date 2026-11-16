import jwt from "jsonwebtoken"
const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null)
        if (!token) {
            return res.status(401).json({ message: "token not found" })
        }
        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)
        req.userId = verifyToken.userId

        next()

    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}

export default isAuth