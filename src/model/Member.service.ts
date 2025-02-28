import { Model } from "mongoose"
import MemberModel from "../schema/Member.schema"
import { MemberInput } from "../libs/types/member/member.input"
import argon2 from 'argon2'

class MemberService {
    memberModel: Model<any>
    constructor() {
        this.memberModel = MemberModel
    }

    public async signup(input:MemberInput): Promise<any> {
        try {
            input.memberPassword = await argon2.hash(input.memberPassword)
            const member = await this.memberModel.create(input);
            return member
        } catch (err: any) {
            throw err
        }
    }
}

export default MemberService