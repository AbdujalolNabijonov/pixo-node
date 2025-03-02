import { ObjectId } from "mongoose"
import { MemberStatus, MemberType } from "../../enums/member.enum"
import { MetaCounter } from "../common"

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

export interface Members {
    list: Member[]
    metaCounter: MetaCounter[]
}