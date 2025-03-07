import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    commentContent: {
        type: String,
        required: true
    },
    commentTargetId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    commentLikes: {
        type: Number,
        default: 0
    }
}, { timestamps: true })


const CommentModel = model("Comment", commentSchema)
export default CommentModel
