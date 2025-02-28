import express, {Request, Response} from "express";
import morgan from "morgan"
import { MORGAN } from "./libs/config";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";

const app = express();
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(morgan(MORGAN))
app.use("/admin", adminRouter)
app.use("/", userRouter)



export default app