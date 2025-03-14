import { Model } from "mongoose";
import { Member } from "../libs/types/member/member";
import { Post, Posts } from "../libs/types/post/post";
import { PostEdit, PostInput, PostInquiry } from "../libs/types/post/post.input";
import PostModel from "../schema/Post.schema";
import MemberService from "./Member.service";
import { T } from "../libs/types/common";
import { PostStatus } from "../libs/enums/post.enum";
import { Direction } from "../libs/enums/common.enum";
import { memberLookup, shapeintomongodbkey } from "../libs/config";
import S3Service from "./S3.service";
import { Errors } from "../libs/Error/Error";
import { HttpCode } from "../libs/enums/httpCode.enum";
import { Message } from "../libs/enums/message.enum";

class PostService {
    postModel: Model<any>;
    memberService;
    s3Service;
    constructor() {
        this.postModel = PostModel
        this.memberService = new MemberService()
        this.s3Service = new S3Service()
    }

    public async createPost(member: Member, data: PostInput): Promise<Post> {
        try {
            data.memberId = member._id;
            const post = await this.postModel.create(data);
            await this.memberService.statsMemberEdit(member._id, 1, "memberPosts")
            return post
        } catch (err: any) {
            throw err
        }
    }

    public async getPosts(member: Member | null, data: PostInquiry): Promise<Posts> {
        try {
            const { page, limit, order, direction, search } = data;
            const { text, postStatus, memberId } = search;

            const match: T = { postStatus: PostStatus.Active }
            if (text) match.postTitle = { $regex: new RegExp(text, "i") }
            if (memberId) { match.memberId = shapeintomongodbkey(memberId) }
            const sort: T = { [order ?? "createdAt"]: direction ?? Direction.DEC }
            const result = await this.postModel.aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $lookup: {
                                    from: "members",
                                    localField: "memberId",
                                    foreignField: "_id",
                                    as: "memberData"
                                }
                            },
                            { $unwind: '$memberData' }
                            //like
                        ],
                        metaCounter: [{ $count: "total" }]
                    }
                }
            ]).exec()
            if (result && result.length > 0) {
                await Promise.all(
                    result[0].list.map(async (post: Post) => {
                        post.postImages = await Promise.all(
                            post.postImages.map(async (key: string) => await this.s3Service.getImageUrl(key))
                        )
                        if (post.memberData?.memberImage) {
                            post.memberData.memberImage = await this.s3Service.getImageUrl(post.memberData?.memberImage)
                        }
                    })
                )
            }
            return result[0]
        } catch (err: any) {
            throw err
        }
    }

    public async getPost(member: Member | null, postId: string): Promise<Post> {
        try {
            const exist = await this.postModel.findOne({ _id: shapeintomongodbkey(postId), postStatus: PostStatus.Active }).exec()
            if (!exist) throw new Errors(HttpCode.NOT_FOUND, Message.NO_POST);
            const result = await this.postModel.aggregate([
                { $match: { _id: exist._id } },
                memberLookup(),
                { $unwind: "$memberData" },
                //like
            ])
            result[0].postImages = await Promise.all(result[0].postImages.map(async (key: string) => await this.s3Service.getImageUrl(key)))
            if (result[0].memberData.memberImage) {
                result[0].memberData.memberImage = await this.s3Service.getImageUrl(result[0].memberData.memberImage)
            }
            return result[0]
        } catch (err: any) {
            throw err
        }
    }

    public async deletePost(member: Member, postId: string): Promise<Post> {
        try {
            const exist = await this.postModel.findOneAndDelete(
                {
                    _id: shapeintomongodbkey(postId),
                    postStatus: PostStatus.Active,
                    memberId: shapeintomongodbkey(member._id)
                }
            ).exec();
            if (!exist) throw new Errors(HttpCode.NOT_FOUND, Message.NO_POST)
            await Promise.all(
                exist.postImages.map(async (key: string) => {
                    await this.s3Service.deleteImage(key)
                })
            )
            return exist
        } catch (err: any) {
            throw err
        }
    }

    public async statsPostEdit(data: PostEdit): Promise<Post> {
        try {
            const post = await this.postModel.findOneAndUpdate(
                { _id: data.postTargetId, postStatus: PostStatus.Active },
                { $inc: { [data.postData]: data.modifier } },
                { new: true }
            )
            return post
        } catch (err: any) {
            throw err
        }
    }
}

export default PostService