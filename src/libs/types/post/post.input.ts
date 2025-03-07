import { ObjectId } from "mongoose"
import { Direction } from "../../enums/common.enum"
import { PostStatus } from "../../enums/post.enum"

export interface PostInput {
    postTitle?: string
    postContent?: string
    postImages?: string[]
    memberId?: ObjectId
}

export interface PostInquiry {
    page: number
    limit: number
    order?: string
    direction?: Direction
    search: search
}
interface search {
    text?: string
    postStatus?: PostStatus
    memberId?: ObjectId
}

export interface PostEdit {
    modifier: number
    postTargetId: ObjectId
    postData:string
}