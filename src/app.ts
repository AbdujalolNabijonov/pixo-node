import express, { Request, Response } from "express";
import morgan from "morgan"
import { MORGAN } from "./libs/config";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import CookieParser from "cookie-parser";
import cors from "cors"

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan(MORGAN))
app.use(CookieParser())
app.use(
    cors({ origin: true, credentials: true })
)


app.use("/admin", adminRouter)
app.use("/", userRouter)



export default app