import dotenv from "dotenv"
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
})
export const MONGODB = String(process.env.MONGODB);
export const PORT = Number(process.env.PORT)
export const MORGAN = ':method :url :status :res[content-length] - :response-time ms'
export const SERCET_TOKEN = String(process.env.SECRET_TOKEN)
export const TOKEN_DURATION = 3
