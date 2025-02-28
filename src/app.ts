import express, {Request, Response} from "express";
import morgan from "morgan"
import { MORGAN } from "./libs/config";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";

const app = express();
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(morgan(MORGAN))


app.use((err:any, req:Request, res:Response, next:any)=>{
    if(err){
        res.json(err)
    }
})



app.use("/admin", adminRouter)
app.use("/", userRouter)



export default app