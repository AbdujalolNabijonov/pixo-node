import dotenv from "dotenv"
import mongoose, { ObjectId } from "mongoose";
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
})

//CONST
export const MONGODB = String(process.env.MONGODB);
export const BUCKET_REGION = String(process.env.BUCKET_REGION)
export const BUCKET_NAME = String(process.env.BUCKET_NAME)
export const S3_ACCESS_KEY = String(process.env.S3_ACCESS_KEY)
export const S3_SECRET_KEY = String(process.env.S3_SECRET_KEY)
export const URL_DURATION = 1 //in hour
export const PORT = Number(process.env.PORT)
export const MORGAN = ':method :url :status :res[content-length] - :response-time ms'
export const SERCET_TOKEN = String(process.env.SECRET_TOKEN)
export const TOKEN_DURATION = 3 //in hour

//CONFIG
export function shapeintomongodbkey(key: ObjectId | string) {
    if (typeof key === "object") return key
    else return new mongoose.Types.ObjectId(key)
}

export const memberLookup = () => ({
    $lookup: {
        from: "members",
        localField: "memberId",
        foreignField: "_id",
        as: "memberData"
    }
})

export const likedLookup = (memberAuthId: ObjectId) => {
    return (
        {
            $lookup: {
                from: "likes",
                let: {
                    memberId: memberAuthId,
                    likeTargetId: "$_id",
                    meLiked: true
                },
                pipeline: [
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and: [
                                    { $eq: ["$memberId", "$$memberId"] },
                                    { $eq: ["$likeTargetId", "$$likeTargetId"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            memberId: "$$memberId",
                            likeTargetId: "$_id",
                            meLiked: "$$meLiked"
                        }
                    }
                ],
                as: "meLiked"
            }
        }
    )
}

export const lookupLikedPost = (memberAuthId: ObjectId) => {
    return (
        {
            $lookup: {
                from: "likes",
                let: {
                    memberId: memberAuthId,
                    likeTargetId: "$_id",
                    meLiked: true,
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$memberId", "$$memberId"] },
                                    { $eq: ["$likeTargetId", "$$likeTargetId"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            likeTargetId: 1,
                            memberId: 1,
                            meLiked: "$$meLiked"
                        }
                    }
                ],
                as: "meLiked"
            }
        }
    )
}

