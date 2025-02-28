import dotenv from "dotenv"
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
})
export const MONGODB = String(process.env.MONGODB);
export const BUCKET_REGION = String(process.env.BUCKET_REGION)
export const BUCKET_NAME = String(process.env.BUCKET_NAME)
export const S3_ACCESS_KEY = String(process.env.S3_ACCESS_KEY)
export const S3_SECRET_KEY = String(process.env.S3_SECRET_KEY)
export const PORT = Number(process.env.PORT)
export const MORGAN = ':method :url :status :res[content-length] - :response-time ms'
export const SERCET_TOKEN = String(process.env.SECRET_TOKEN)
export const TOKEN_DURATION = 3
