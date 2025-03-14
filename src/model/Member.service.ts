import { Model, ObjectId } from "mongoose"
import MemberModel from "../schema/Member.schema"
import { MemberInput, MemberLogInput } from "../libs/types/member/member.input"
import argon2 from 'argon2'
import { Member, Members } from "../libs/types/member/member"
import { Errors } from "../libs/Error/Error"
import { HttpCode } from "../libs/enums/httpCode.enum"
import { Message } from "../libs/enums/message.enum"
import { MemberStatus, MemberType } from "../libs/enums/member.enum"
import { T } from "../libs/types/common"
import { shapeintomongodbkey } from "../libs/config"
import S3Service from "./S3.service"
import { MemberUpdate } from "../libs/types/member/member.update"

class MemberService {
    memberModel: Model<any>;
    s3Service;
    constructor() {
        this.memberModel = MemberModel
        this.s3Service = new S3Service()
    }

    public async signup(file: any, input: MemberInput): Promise<Member> {
        try {
            if (file) {
                const imageName = await this.s3Service.uploadImage(file)
                input.memberImage = imageName as string
            }
            input.memberPassword = await argon2.hash(input.memberPassword)
            const member = await this.memberModel.create(input);
            delete member.memberPassword
            return member
        } catch (err: any) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.ALREADY_EXIST)
        }
    }

    public async login(data: MemberLogInput): Promise<Member> {
        try {
            const exist = await this.memberModel
                .findOne(
                    { memberNick: data.memberNick, memberStatus: MemberStatus.ACTIVE }
                )
                .select("+memberPassword")
                .exec();
            if (!exist) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER)

            const isMatch = await argon2.verify(exist.memberPassword, data.memberPassword);
            if (!isMatch) throw new Errors(HttpCode.BAD_REQUEST, Message.WRONG_PASSWORD)

            const member = await this.memberModel.findById(exist._id).lean().exec()
            if (member.memberImage) member.memberImage = await this.s3Service.getImageUrl(member.memberImage)
            return member
        } catch (err: any) {
            throw err
        }
    }

    public async getMember(member: Member | null, memberId: string): Promise<Member> {
        try {
            const match: T = { _id: shapeintomongodbkey(memberId), memberStatus: MemberStatus.ACTIVE }
            const exist = await this.memberModel.aggregate([
                { $match: match },
                { $project: { memberPassword: 0 } }
                //like
            ]).exec();
            if (!exist) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER);
            if (exist[0].memberImage) {
                exist[0].memberImage = await this.s3Service.getImageUrl(exist[0].memberImage)
            }
            return exist[0]
        } catch (err: any) {
            throw err
        }
    }

    public async updateMember(file: any, member: Member, data: MemberUpdate): Promise<Member> {
        try {
            if (file) {
                if (member.memberImage) await this.s3Service.deleteImage(member.memberImage)
                data.memberImage = await this.s3Service.uploadImage(file)
            }
            const updatedMember = await this.memberModel
                .findOneAndUpdate(
                    { _id: member._id, memberStatus: MemberStatus.ACTIVE },
                    data,
                    { new: true }
                )
                .lean()
                .exec()
            return updatedMember
        } catch (err: any) {
            throw err
        }
    }

    public async getMembers(member: Member | null): Promise<Members> {
        const match: T = { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.USER }
        const members = await this.memberModel.aggregate([
            { $match: match },
            { $project: { memberPassword: 0 } },
            {
                $facet: {
                    list: [
                        { $sort: { createdAt: -1 } },
                        //like
                    ],
                    metaCounter: [{ $count: "total" }]
                }
            }
        ]).exec();

        if (!members[0]) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA);
        await Promise.all(
            members[0].list.map(async (member: Member) => {
                if (member.memberImage) {
                    member.memberImage = await this.s3Service.getImageUrl(member.memberImage)
                }
            })
        )
        return members[0]
    }

    public async statsMemberEdit(memberId: ObjectId, modifier: number, key: string) {
        try {
            const member = await this.memberModel.findOneAndUpdate(
                { _id: memberId, memberStatus: MemberStatus.ACTIVE },
                { $inc: { [key]: modifier } },
                { new: true }
            ).lean().exec()
            if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER)
            return member
        } catch (err: any) {
            throw err
        }
    }
}

export default MemberService