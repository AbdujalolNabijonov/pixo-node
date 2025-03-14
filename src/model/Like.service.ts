import { Model, ObjectId } from "mongoose";
import { LikeInput } from "../libs/types/like/like.input";
import LikeModel from "../schema/Like.schema";
import { shapeintomongodbkey } from "../libs/config";
import MemberService from "./Member.service";
import { LikeGroup } from "../libs/enums/like.enum";
import { Member } from "../libs/types/member/member";

class LikeService {
    likeModel: Model<any>
    memberService
    constructor() {
        this.likeModel = LikeModel
        this.memberService = new MemberService()
    }
    public async likeTargetMember(member: Member, targetId: string): Promise<Member> {
        try {
            const memberId = shapeintomongodbkey(member._id)
            const likeTargetId = shapeintomongodbkey(targetId)
            const exist = await this.existedLike(memberId as ObjectId, likeTargetId as ObjectId);
            let result = null
            if (exist) {
                await this.likeModel.findOneAndDelete({ memberId, likeTargetId, likeGroup: LikeGroup.MEMBER });
                result = await this.memberService.statsMemberEdit(likeTargetId as ObjectId, -1, "memberLikes")
            } else {
                await this.likeModel.create({ memberId, likeTargetId, likeGroup: LikeGroup.MEMBER });
                result = await this.memberService.statsMemberEdit(likeTargetId as ObjectId, 1, "memberLikes")
            }
            return result
        } catch (err: any) {
            throw err
        }
    }

    private async existedLike(memberId: ObjectId, likeTargetId: ObjectId): Promise<boolean> {
        const exist = await this.likeModel.findOne({ memberId, likeTargetId }).exec()
        if (exist) { return true }
        else { return false }
    }
}

export default LikeService