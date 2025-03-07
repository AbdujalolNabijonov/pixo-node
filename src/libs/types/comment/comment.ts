import { ObjectId } from "mongoose"
import { MetaCounter } from "../common";
import { Member } from "../member/member";

export interface Comment {
    _id: ObjectId;
    memberId: ObjectId;
    commentContent: string;
    commentTargetId: ObjectId;
    commentLikes: number;
    memberData?: Member
    createdAt: Date;
    updatedAt: Date;
}

export interface Comments {
    list: Comment[]
    metaCounter: MetaCounter[]
}