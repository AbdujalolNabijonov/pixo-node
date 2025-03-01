import { Schema, model } from "mongoose"
import { PostStatus } from "../libs/enums/post.enum"

const postSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    postTitle: {
        type: String
    },
    postContent: {
        type: String
    },
    postImages: {
        type: [String]
    },
    postStatus: {
        type: String,
        enum: PostStatus,
        default: PostStatus.Active
    },
    postLikes: {
        type: Number,
        default: 0
    },
    postViews: {
        type: Number,
        default: 0
    },
    postComments: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const PostModel = model("Post", postSchema)
export default PostModel