import { ObjectId } from "mongoose";

export interface CommentInput {
    commentContent: string;
    memberId: ObjectId
    commentTargetId: ObjectId
}