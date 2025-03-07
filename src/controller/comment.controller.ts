import { HttpCode } from "../libs/enums/httpCode.enum";
import { RequestAuth, T } from "../libs/types/common";
import { Request, Response } from "express"
import CommentService from "../model/Comment.service";
import { Member } from "../libs/types/member/member";

const commentController: T = {}
const commentService = new CommentService()
commentController.createComment = async (req: RequestAuth, res: Response) => {
    try {
        console.log("POST: createComment")
        const data = req.body;
        const comment = await commentService.createComment(req.member as Member, data)
        res.status(HttpCode.CREATED).json({ value: comment })
    } catch (err: any) {
        console.log(`Error: createComment, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message })
    }
}

export default commentController