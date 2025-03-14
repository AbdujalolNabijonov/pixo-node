import { ObjectId } from "mongoose";

export interface Like {
    _id: ObjectId
    memberId: ObjectId;
    likeTargetId: ObjectId
    likeGroup: string
    createdAt: Date
    updatedAt: Date
}