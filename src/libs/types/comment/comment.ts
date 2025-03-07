import { ObjectId } from "mongoose"

export interface Comment {
    _id: ObjectId;
    memberId: ObjectId;
    commentContent: string;
    commentTargetId: ObjectId;
    commentLikes: number;
    createdAt: Date;
    updatedAt: Date;
}