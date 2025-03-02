import { Router } from "express"
import memberController from "../controller/member.controller"
import uploader from "../libs/utility/imageUploader"
import postController from "../controller/post.controller";
import { isMemberAuth, memberRetrieve } from "../libs/middleware/auth.md";

const userRouter = Router()

//MEMBER API
userRouter.post(
    "/member/signup",
    uploader.single("memberImage"),
    memberController.signup
);

userRouter.post(
    "/member/login",
    memberController.login
)

userRouter.get(
    "/member/members",
    isMemberAuth,
    memberController.getMembers
)

userRouter.post(
    "/member/edit",
    memberRetrieve,
    uploader.single("memberImage"),
    memberController.updateMember
)

userRouter.get(
    "/member/:id",
    isMemberAuth,
    memberController.getMember
)



//POST API
userRouter.post(
    "/post/createpost",
    memberRetrieve,
    uploader.array("postImages", 5),
    postController.createPost
)

userRouter.get(
    "/post/posts",
    isMemberAuth,
    postController.getPosts
)

userRouter.post(
    "/post/delete/:id",
    memberRetrieve,
    postController.deletePost
)


export default userRouter