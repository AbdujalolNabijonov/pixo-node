import { ObjectId } from "mongoose"
import { PostStatus } from "../../enums/post.enum"
import { MetaCounter } from "../common"

export interface Post {
    _id: ObjectId
    memberId: ObjectId
    postTitle?: string
    postContent?: string
    postStatus: PostStatus
    postImages: string[]
    postUrls: string[]
    postLikes: number
    postViews: number
    postComments: number
    createdAt: Date
    updatedAt: Date
}

export interface Posts {
    list: Post[],
    metaCounter: MetaCounter[]
}