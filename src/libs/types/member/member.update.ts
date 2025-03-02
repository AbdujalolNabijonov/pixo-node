import { MemberStatus, MemberType } from "../../enums/member.enum"

export interface UpdateMember{
        memberType?: MemberType
        memberStatus?: MemberStatus
        memberNick?: string
        memberPhone?: string
        memberImage?: string
        memberDesc?: string
}