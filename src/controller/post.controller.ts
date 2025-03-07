import { HttpCode } from "../libs/enums/httpCode.enum";
import { Message } from "../libs/enums/message.enum";
import { Errors } from "../libs/Error/Error";
import { RequestAuth, T } from "../libs/types/common";
import { Request, Response } from "express"
import { PostInput, PostInquiry } from "../libs/types/post/post.input";
import PostService from "../model/Post.service";
import S3Service from "../model/S3.service";
import { Member } from "../libs/types/member/member";

const postController: T = {};
const postService = new PostService()
const s3Service = new S3Service()

postController.createPost = async (req: RequestAuth, res: Response) => {
    try {
        console.log("POST: createPost")
        const data: PostInput = req.body;
        const files = req.files as [];
        if (!req.member) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED)
        }
        if (files.length === 0) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.IMAGES_NOT_PROVIDED)
        }
        const postImages = []
        for (let file of files as []) {
            postImages.push(await s3Service.uploadImage(file))
        }
        data.postImages = postImages
        const post = await postService.createPost(req.member, data)
        res.status(HttpCode.CREATED).json({ value: post })
    } catch (err: any) {
        console.log(`Error: createPost, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.messsage })
    }
}

postController.getPosts = async (req: RequestAuth, res: Response) => {
    try {
        console.log("GET: getPosts")
        const data: PostInquiry = req.body;
        const result = await postService.getPosts(req.member, data)
        res.status(HttpCode.OK).json({ value: result })
    } catch (err: any) {
        console.log(`Error: getPosts, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.messsage })
    }
}

postController.deletePost = async (req: RequestAuth, res: Response) => {
    try {
        console.log("POST: deletePost")
        const postId = req.params.id as string;
        const post = await postService.deletePost(req.member as Member, postId);
        res.status(HttpCode.OK).json({ value: post })
    } catch (err: any) {
        console.log(`Error: deletePost, ${err.message}`)
        res.status(HttpCode.NOT_FOUND).json({ code: HttpCode.BAD_REQUEST, message: err.message })
    }
}

export default postController