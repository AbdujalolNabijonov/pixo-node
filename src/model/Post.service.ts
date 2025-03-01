import { Model } from "mongoose";
import { Member } from "../libs/types/member/member";
import { Post } from "../libs/types/post/post";
import { PostInput } from "../libs/types/post/post.input";
import PostModel from "../schema/Post.schema";
import MemberService from "./Member.service";

class PostService {
    postModel:Model<any>
    memberService
    constructor() {
        this.postModel = PostModel
        this.memberService = new MemberService()
    }

    public async createPost(member: Member, data: PostInput): Promise<Post> {
        try {
            data.memberId = member._id;
            const post = await this.postModel.create(data);
            await this.memberService.statsMemberEdit(member._id, 1)
            return post
        } catch (err: any) {
            throw err
        }
    }
}

export default PostService