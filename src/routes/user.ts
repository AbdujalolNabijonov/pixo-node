import { Router } from "express"
import memberController from "../controller/member.controller"
import uploader from "../libs/utility/imageUploader"
import postController from "../controller/post.controller";
import { isMemberAuth, memberRetrieve } from "../libs/middleware/auth.md";

const userRouter = Router()

//MEMBER API
userRouter.post("/member/signup", uploader.single("memberImage"), memberController.signup);
userRouter.post("/member/login", memberController.login)

//POST API
userRouter.post(
    "/post/createpost",
    memberRetrieve,
    uploader.array("postImages"),
    postController.createPost
)
userRouter.get(
    "/post/posts",
    isMemberAuth,
    postController.getPosts
)

export default userRouter