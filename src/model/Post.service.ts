import { Model } from "mongoose";
import { Member } from "../libs/types/member/member";
import { Post } from "../libs/types/post/post";
import { PostInput } from "../libs/types/post/post.input";
import PostModel from "../schema/Post.schema";

class PostService {
    postModel:Model<any>
    constructor() {
        this.postModel = PostModel
    }

    public async createPost(member: Member, data: PostInput): Promise<Post> {
        try {
            data.memberId = member._id;
            const post = await this.postModel.create(data);
            return post
        } catch (err: any) {
            throw err
        }
    }
}

export default PostService