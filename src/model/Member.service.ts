import { Model } from "mongoose"
import MemberModel from "../schema/Member.schema"

class MemberService {
    memberModel: Model<any>
    constructor() {
        this.memberModel = MemberModel
    }

    public async signup(): Promise<any> {
        try {
            
        } catch (err: any) {
            throw err
        }
    }
}

export default MemberService