import { HttpCode } from "../libs/enums/httpCode.enum";
import { Message } from "../libs/enums/message.enum";
import { Errors } from "../libs/Error/Error";
import { RequestAuth, T } from "../libs/types/common";
import { Request, Response } from "express"
import { PostInput } from "../libs/types/post/post.input";
import PostService from "../model/Post.service";

const postController: T = {};
const postService = new PostService()

postController.createPost = async (req: RequestAuth, res: Response) => {
    try {
        const data: PostInput = req.body;
        const files =req.files;
        if (!files) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.IMAGES_NOT_PROVIDED)
        }
        console.log(files);
        const post = await postService.createPost(req.member, data)
    } catch (err: any) {
        console.log(`Error: createPost, ${err.message}`)
        const message = new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        res.status(HttpCode.BAD_REQUEST).json({ status: HttpCode.BAD_REQUEST, message })
    }
}

export default postController