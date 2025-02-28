import dotenv from "dotenv"
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
})
export const MONGODB = process.env.MONGODB;
export const PORT = process.env.PORT
export const MORGAN = ':method :url :status :res[content-length] - :response-time ms'
