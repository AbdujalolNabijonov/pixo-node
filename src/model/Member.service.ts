import { Model, ObjectId } from "mongoose"
import MemberModel from "../schema/Member.schema"
import { MemberInput, MemberLogInput } from "../libs/types/member/member.input"
import argon2 from 'argon2'
import { Member } from "../libs/types/member/member"
import { Errors } from "../libs/Error/Error"
import { HttpCode } from "../libs/enums/httpCode.enum"
import { Message } from "../libs/enums/message.enum"
import { MemberStatus } from "../libs/enums/member.enum"
import { T } from "../libs/types/common"
import { shapeintomongodbkey } from "../libs/config"

class MemberService {
    memberModel: Model<any>
    constructor() {
        this.memberModel = MemberModel
    }

    public async signup(input: MemberInput): Promise<Member> {
        try {
            input.memberPassword = await argon2.hash(input.memberPassword)
            const member = await this.memberModel.create(input);
            delete member.memberPassword
            return member
        } catch (err: any) {
            throw err
        }
    }

    public async login(data: MemberLogInput): Promise<Member> {
        try {
            const exist = await this.memberModel
                .findOne({ memberNick: data.memberNick, memberStatus: MemberStatus.ACTIVE }).select("+memberPassword").exec();
            if (!exist) {
                throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER)
            }
            const isMatch = await argon2.verify(exist.memberPassword, data.memberPassword);
            if (!isMatch) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.WRONG_PASSWORD)
            }
            const member = await this.memberModel.findById(exist._id).lean().exec()
            return member
        } catch (err: any) {
            throw err
        }
    }

    public async getMember(member: Member | null, memberId: string): Promise<Member> {
        try {
            const match: T = { _id: shapeintomongodbkey(memberId), memberStatus: MemberStatus.ACTIVE }
            const exist = await this.memberModel.aggregate([
                { $match: match },
                { $project: { memberPassword: 0 } }
                //like
            ]).exec();
            if (!exist) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER);
            return exist[0]
        } catch (err: any) {
            throw err
        }
    }
    public async statsMemberEdit(memberId: ObjectId, modifier: number) {
        try {
            const member = await this.memberModel.findOneAndUpdate(
                { _id: memberId, memberStatus: MemberStatus.ACTIVE },
                { $inc: { memberPosts: modifier } }
            ).lean().exec()
            if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER)
            return member
        } catch (err: any) {
            throw err
        }
    }
}

export default MemberService