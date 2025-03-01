import { Router } from "express"
import memberController from "../controller/member.controller"
import uploader from "../libs/utility/imageUploader"
import postController from "../controller/post.controller";
import memberRetrieve from "../libs/middleware/auth.md";

const userRouter = Router()

userRouter.post("/signup", uploader.single("memberImage"), memberController.signup);
userRouter.post("/login", memberController.login)
userRouter.post(
    "/createpost",
    memberRetrieve,
    uploader.array("postImages"),
    postController.createPost
)

export default userRouter