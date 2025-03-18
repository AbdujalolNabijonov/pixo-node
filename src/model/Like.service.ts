import { Model, ObjectId } from "mongoose";
import { LikeInput } from "../libs/types/like/like.input";
import LikeModel from "../schema/Like.schema";
import { likedLookup, memberLookup, shapeintomongodbkey } from "../libs/config";
import MemberService from "./Member.service";
import { LikeGroup } from "../libs/enums/like.enum";
import { Member } from "../libs/types/member/member";
import PostService from "./Post.service";
import { FavorityPostInquiry, PostEdit } from "../libs/types/post/post.input";
import { Errors } from "../libs/Error/Error";
import { HttpCode } from "../libs/enums/httpCode.enum";
import { Message } from "../libs/enums/message.enum";
import { T } from "../libs/types/common";
import { Posts } from "../libs/types/post/post";
import S3Service from "./S3.service";
import { PostStatus } from "../libs/enums/post.enum";

class LikeService {
    likeModel: Model<any>
    memberService
    postService
    s3Service
    constructor() {
        this.likeModel = LikeModel
        this.memberService = new MemberService()
        this.postService = new PostService()
        this.s3Service = new S3Service()
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
                await this.likeModel.findOneAndDelete({ memberId, likeTargetId, likeGroup: LikeGroup.POST });
                const postData: PostEdit = {
                    postTargetId: targetId as ObjectId,
                    postData: "postLikes",
                    modifier: -1
                }
                result = await this.postService.statsPostEdit(postData)
            } else {
                await this.likeModel.create({ memberId, likeTargetId, likeGroup: LikeGroup.POST });
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

    public async getFavorityPosts(member: Member, data: FavorityPostInquiry): Promise<Posts> {
        try {
            const { page, limit, order, direction } = data
            const memberAuthId = shapeintomongodbkey(member._id)

            const match: T = {
                memberId: memberAuthId,
                likeGroup: LikeGroup.POST
            }
            const result = await this.likeModel.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: "posts",
                        let: {
                            likeTargetId: "$likeTargetId"
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq:["$_id","$$likeTargetId"]},
                                        {$eq:["$postStatus","ACTIVE"]}
                                    ]
                                }
                            }
                        }],
                        as: "postData"
                    }
                },
                { $unwind: "$postData" },
                {
                    $facet: {
                        list: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $lookup: {
                                    from: "members",
                                    localField: "postData.memberId",
                                    foreignField: "_id",
                                    as: "postData.memberData"
                                }
                            },
                            { $unwind: "$postData.memberData" },
                        ],
                        metaCounter: [{ $count: "total" }]
                    }
                }
            ]).exec()
            if (result[0]) {
                result[0].list = await Promise.all(result[0].list.map(async (data: any) => {
                    data.postData.postImages = await Promise.all(
                        data.postData.postImages.map(async (key: string) => await this.s3Service.getImageUrl(key))
                    )
                    data.postData.meLiked = [{ meLiked: true }]
                    if (data.postData.memberData.memberImage) {
                        data.postData.memberData.memberImage = await this.s3Service.getImageUrl(data.postData.memberData.memberImage)
                    }
                    return data.postData
                }))
            }
            console.log(result[0])
            return result[0]
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