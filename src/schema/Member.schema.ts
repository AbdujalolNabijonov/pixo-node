import { Schema, model } from "mongoose"
import { MemberStatus, MemberType } from "../libs/enums/member.enum"

const memberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.USER
    },
    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },
    memberNick: {
        type: String,
        required: true,
        index: { unique: true, sparse: true }
    },
    memberPassword:{
        type:String
    },
    memberPhone: {
        type: String,
        required: true,
        index: { unique: true, sparse: true }
    },
    memberImage: {
        type: String
    },
    memberDesc: {
        type: String
    },
    memberPosts: {
        type: Number,
        default: 0
    },
    memberWarnings: {
        type: Number,
        default: 0
    }
}, { timestamps: true})

const MemberModel = model("Member",memberSchema)
export default MemberModel