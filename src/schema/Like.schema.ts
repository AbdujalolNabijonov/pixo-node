import { model, Schema } from "mongoose";
import { LikeGroup } from "../libs/enums/like.enum";

const likeSchema = new Schema({
    likeTargetId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    memberId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    likeGroup: {
        type: String,
        enum: LikeGroup,
        required: true
    }
}, { timestamps: true })

const LikeModel = model("Like", likeSchema)

export default LikeModel