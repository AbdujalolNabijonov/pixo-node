import { Model, ObjectId } from "mongoose"
import { Comment, Comments } from "../libs/types/comment/comment"
import { CommentInput } from "../libs/types/comment/comment.input"
import { Member } from "../libs/types/member/member"
import CommentModel from "../schema/Comment.schema"
import { memberLookup, shapeintomongodbkey } from "../libs/config"
import { Errors } from "../libs/Error/Error"
import { HttpCode } from "../libs/enums/httpCode.enum"
import { Message } from "../libs/enums/message.enum"
import PostService from "./Post.service"
import { PostEdit } from "../libs/types/post/post.input"
import { T } from "../libs/types/common"
import S3Service from "./S3.service"

class CommentService {
    commentModel: Model<any>
    postService
    s3service
    constructor() {
        this.commentModel = CommentModel
        this.postService = new PostService()
        this.s3service = new S3Service()
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

    public async getComments(commnetTargetId: string): Promise<Comments> {
        try {
            const match: T = { commentTargetId: shapeintomongodbkey(commnetTargetId) }
            const comments = await this.commentModel.aggregate([
                { $match: match },
                {
                    $facet: {
                        list: [
                            memberLookup(),
                            { $unwind: "$memberData" }
                            //like
                        ],
                        metaCounter: [{ $count: "total" }]
                    }
                }
            ]).exec()
            comments[0].list = await Promise.all(comments[0].list.map(async (comment: Comment) => {
                if (comment.memberData?.memberImage) {
                    comment.memberData.memberImage = await this.s3service.getImageUrl(comment.memberData?.memberImage)
                }
                return comment
            }))
            return comments[0]
        } catch (err: any) {
            throw err
        }
    }
}

export default CommentService