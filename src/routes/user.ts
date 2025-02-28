import { Router } from "express"
import memberController from "../controller/member.controller"

const userRouter = Router()

userRouter.post("/signup", memberController.signup)

export default userRouter