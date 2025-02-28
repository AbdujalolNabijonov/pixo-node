import { ObjectId } from "mongoose"
import { MemberStatus, MemberType } from "../../enums/member.enum"

export interface Member {
    _id: ObjectId
    memberType: MemberType
    memberStatus: MemberStatus
    memberNick: string
    memberPhone: string
    memberImage?: string
    memberDesc?: string
    memberPosts: number
    memberWarnings: number
    createdAt: Date
    updatedAt: Date
}