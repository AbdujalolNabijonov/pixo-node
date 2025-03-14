import { Model, ObjectId } from "mongoose";
import { LikeInput } from "../libs/types/like/like.input";
import LikeModel from "../schema/Like.schema";
import { shapeintomongodbkey } from "../libs/config";
import MemberService from "./Member.service";
import { LikeGroup } from "../libs/enums/like.enum";
import { Member } from "../libs/types/member/member";
import PostService from "./Post.service";
import { PostEdit } from "../libs/types/post/post.input";
import { Errors } from "../libs/Error/Error";
import { HttpCode } from "../libs/enums/httpCode.enum";
import { Message } from "../libs/enums/message.enum";

class LikeService {
    likeModel: Model<any>
    memberService
    postService
    constructor() {
        this.likeModel = LikeModel
        this.memberService = new MemberService()
        this.postService = new PostService()
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
            if (!result) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_USER)
            return result
        } catch (err: any) {
            throw err
        }
    }

    public async likeTargetPost(member: Member, likeTargetId: string) {
        try {
            const memberId = shapeintomongodbkey(member._id);
            const targetId = shapeintomongodbkey(likeTargetId);
            const exist = await this.existedLike(memberId as ObjectId, targetId as ObjectId);
            let result = null
            if (exist) {
                await this.likeModel.findOneAndDelete({ memberId, likeTargetId, likeGroup: LikeGroup.MEMBER });
                const postData: PostEdit = {
                    postTargetId: targetId as ObjectId,
                    postData: "postLikes",
                    modifier: -1
                }
                result = await this.postService.statsPostEdit(postData)
            } else {
                await this.likeModel.create({ memberId, likeTargetId, likeGroup: LikeGroup.MEMBER });
                const postData: PostEdit = {
                    postTargetId: targetId as ObjectId,
                    postData: "postLikes",
                    modifier: 1
                }
                result = await this.postService.statsPostEdit(postData)
            }
            if (!result) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA)
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