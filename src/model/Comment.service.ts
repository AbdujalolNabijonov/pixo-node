import { Model, ObjectId } from "mongoose"
import { Comment } from "../libs/types/comment/comment"
import { CommentInput } from "../libs/types/comment/comment.input"
import { Member } from "../libs/types/member/member"
import CommentModel from "../schema/Comment.schema"
import { shapeintomongodbkey } from "../libs/config"
import { Errors } from "../libs/Error/Error"
import { HttpCode } from "../libs/enums/httpCode.enum"
import { Message } from "../libs/enums/message.enum"
import PostService from "./Post.service"
import { PostEdit } from "../libs/types/post/post.input"

class CommentService {
    commentModel: Model<any>
    postService
    constructor() {
        this.commentModel = CommentModel
        this.postService = new PostService()
    }

    public async createComment(member: Member, data: CommentInput): Promise<Comment> {
        try {
            if (!data.commentContent) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_COMMENT)
            data.memberId = shapeintomongodbkey(member._id) as ObjectId;
            data.commentTargetId = shapeintomongodbkey(data.commentTargetId) as ObjectId
            const comment = await this.commentModel.create(data);
            if (comment) {
                const postdata: PostEdit = {
                    postData: "postComments",
                    modifier: 1,
                    postTargetId: data.commentTargetId
                }
                await this.postService.statsPostEdit(postdata)
            }
            return comment
        } catch (err: any) {
            throw err
        }
    }
}

export default CommentService