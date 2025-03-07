import { HttpCode } from "../libs/enums/httpCode.enum";
import { RequestAuth, T } from "../libs/types/common";
import { Request, Response } from "express"
import CommentService from "../model/Comment.service";
import { Member } from "../libs/types/member/member";
import { Errors } from "../libs/Error/Error";
import { Message } from "../libs/enums/message.enum";

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

commentController.getComments = async (req: RequestAuth, res: Response) => {
    try {
        console.log("POST: getComments")
        const commnetTargetId = req.body.commentTargetId
        if(!commnetTargetId) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_ID_PROVIDE)
        const result = await commentService.getComments(commnetTargetId);
        res.status(HttpCode.CREATED).json({ value: result })
    } catch (err: any) {
        console.log(`Error: getComments, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message })
    }
}

export default commentController