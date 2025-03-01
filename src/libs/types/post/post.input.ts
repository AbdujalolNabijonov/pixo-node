import { ObjectId } from "mongoose"

export interface PostInput{
    postTitle?:string
    postContent?:string
    postImages?:string[]
    memberId?:ObjectId
}