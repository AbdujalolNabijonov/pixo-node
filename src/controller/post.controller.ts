import { HttpCode } from "../libs/enums/httpCode.enum";
import { Message } from "../libs/enums/message.enum";
import { Errors } from "../libs/Error/Error";
import { RequestAuth, T } from "../libs/types/common";
import { Request, Response } from "express"
import { PostInput, PostInquiry } from "../libs/types/post/post.input";
import PostService from "../model/Post.service";
import S3Service from "../model/S3.service";

const postController: T = {};
const postService = new PostService()
const s3Service = new S3Service()

postController.createPost = async (req: RequestAuth, res: Response) => {
    try {
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
        const message = new Errors(HttpCode.BAD_REQUEST, err.message)
        res.status(HttpCode.BAD_REQUEST).json({ status: HttpCode.BAD_REQUEST, message })
    }
}

postController.getPosts = async (req: RequestAuth, res: Response) => {
    try {
        const data: PostInquiry = req.body;
        const result = await postService.getPosts(req.member, data)
        res.status(HttpCode.OK).json({ value: result })
    } catch (err: any) {
        console.log(`Error: getPosts, ${err.message}`)
        const message = new Errors(HttpCode.BAD_REQUEST, err.message)
        res.status(HttpCode.BAD_REQUEST).json({ status: HttpCode.BAD_REQUEST, message })
    }
}

export default postController