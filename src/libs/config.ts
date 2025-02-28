import dotenv from "dotenv"
dotenv.config({
    path:process.env.NODE_ENV==="production"?".env.production":".env.development"
})
export const MONGODB = process.env.MONGODB;
