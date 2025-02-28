import { Router } from "express"
import memberController from "../controller/member.controller"
import uploader from "../libs/utility/imageUploader"

const userRouter = Router()

userRouter.post("/signup",uploader.single("memberImage"), memberController.signup);
userRouter.post("/login", memberController.login)

export default userRouter