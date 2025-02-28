import { Model } from "mongoose"
import MemberModel from "../schema/Member.schema"
import { MemberInput } from "../libs/types/member/member.input"

class MemberService {
    memberModel: Model<any>
    constructor() {
        this.memberModel = MemberModel
    }

    public async signup(input:MemberInput): Promise<any> {
        try {
            const member = await this.memberModel.create(input);
            return member
        } catch (err: any) {
            throw err
        }
    }
}

export default MemberService