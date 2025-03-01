import { ObjectId } from "mongoose"
import { PostStatus } from "../../enums/post.enum"

export interface Post {
    _id:ObjectId
    memberId: ObjectId
    postTitle?: string
    postContent?: string
    postStatus: PostStatus
    postLikes: number
    postViews: number
    postComments: number
    createdAt:Date
    updatedAt:Date
}