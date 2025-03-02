import { RequestAuth, T } from "../libs/types/common";
import { Request, Response } from "express"
import { Member } from "../libs/types/member/member";
import MemberService from "../model/Member.service";
import { MemberInput, MemberLogInput } from "../libs/types/member/member.input";
import { HttpCode } from "../libs/enums/httpCode.enum";
import { Errors } from "../libs/Error/Error";
import { Message } from "../libs/enums/message.enum";
import AuthService from "../model/Auth.service";
import { BUCKET_REGION, TOKEN_DURATION } from "../libs/config";
import S3Service from "../model/S3.service";
import { UpdateMember } from "../libs/types/member/member.update";

const memberController: T = {}
const memberService = new MemberService()
const authService = new AuthService()
const s3Service = new S3Service()

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("POST: signup")
        const data: MemberInput = req.body;
        const file = req.file;
        if (file) {
            console.log(BUCKET_REGION)
            const imageName = await s3Service.uploadImage(file)
            data.memberImage = imageName as string
            console.log("file:", req.file)
        }
        const member: Member = await memberService.signup(data)
        //@ts-ignore
        const token = await authService.createToken(member.toObject())
        res.cookie("accessToken", token, {
            maxAge: 60 * 60 * 1000 * TOKEN_DURATION,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production"
        })
        res.status(HttpCode.CREATED).json({ value: member })
    } catch (err: any) {
        console.log(`Error: signup, ${err.message}`)
        const message = new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        res.status(HttpCode.BAD_REQUEST).json({ err: message })
    }
}

memberController.login = async (req: Request, res: Response) => {
    try {
        console.log("POST: login")
        const data: MemberLogInput = req.body;
        const member: Member = await memberService.login(data);
        if (member.memberImage) {
            member.memberImage = await s3Service.getImageUrl(member.memberImage)
        }
        const token = await authService.createToken(member)
        res.cookie("accessToken", token, {
            maxAge: 60 * 60 * 1000 * TOKEN_DURATION,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production"
        })
        res.status(HttpCode.FOUND).json({ value: member })
    } catch (err: any) {
        console.log(`Error: login, ${err.message}`)
        const message = new Errors(HttpCode.INTERNAL_SERVER_ERROR, err.message)
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ err: message })
    }
}

memberController.getMember = async (req: RequestAuth, res: Response) => {
    try {
        console.log("GET: getMember")
        const memberId = req.params.id as string;
        const member = await memberService.getMember(req.member, memberId);
        res.status(HttpCode.OK).json({ value: member })
    } catch (err: any) {
        console.log(`Error: getMember, ${err.message}`)
        const message = new Errors(HttpCode.NOT_FOUND, err.message)
        res.status(HttpCode.NOT_FOUND).json({ err: message })
    }
}

export default memberController