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
import { MemberUpdate } from "../libs/types/member/member.update";
import LikeService from "../model/Like.service";

const memberController: T = {}
const memberService = new MemberService()
const authService = new AuthService()
const likeService = new LikeService()

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("POST: signup")
        const data: MemberInput = req.body;
        const file = req.file;
        const member: Member = await memberService.signup(file, data)
        //@ts-ignore
        const token = await authService.createToken(member.toObject())
        res.cookie("accessToken", token, {
            maxAge: 60 * 60 * 1000 * TOKEN_DURATION,
            httpOnly: false,
        })
        res.status(HttpCode.CREATED).json({ value: member })
    } catch (err: any) {
        console.log(`Error: signup, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message })
    }
}

memberController.logout = (req: Request, res: Response) => {
    try {
        console.log("POST: logout")
        res.cookie("accessToken", null, {
            maxAge: 0,
            httpOnly: false,
        })
        res.status(HttpCode.CREATED).json({ value: "done" })
    } catch (err: any) {
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message })
    }
}

memberController.login = async (req: Request, res: Response) => {
    try {
        console.log("POST: login")
        const data: MemberLogInput = req.body;
        const member: Member = await memberService.login(data);
        const token = await authService.createToken(member)
        res.cookie("accessToken", token, {
            maxAge: 60 * 60 * 1000 * TOKEN_DURATION,
            httpOnly: false,
        })
        res.status(HttpCode.OK).json({ value: member })
    } catch (err: any) {
        console.log(`Error: login, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message })
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
        res.status(HttpCode.NOT_FOUND).json({ code: message.code, message: message.message })
    }
}

memberController.updateMember = async (req: RequestAuth, res: Response) => {
    try {
        console.log("POST: updateMember")
        const data: MemberUpdate = req.body;
        const member = await memberService.updateMember(req.file, req.member as Member, data)
        const token = await authService.createToken(member)
        res.cookie("accessToken", token, {
            maxAge: 60 * 60 * 1000 * TOKEN_DURATION,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production"
        })
        res.status(HttpCode.OK).json({ value: member })
    } catch (err: any) {
        console.log(`Error: updateMember, ${err.message}`)
        const message = new Errors(HttpCode.NOT_MODIFIED, err.message)
        res.status(HttpCode.NOT_MODIFIED).json({ code: message.code, message: message.message })
    }
}

memberController.getMembers = async (req: RequestAuth, res: Response) => {
    try {
        console.log("GET: getMembers")
        const result = await memberService.getMembers(req.member)
        res.status(HttpCode.OK).json({ value: result })
    } catch (err: any) {
        console.log(`Error: getMembers, ${err.message}`)
        const message = new Errors(HttpCode.BAD_REQUEST, err.message)
        res.status(HttpCode.BAD_REQUEST).json({ code: message.code, message: message.message })
    }
}

memberController.likeTargetMember = async (req: RequestAuth, res: Response) => {
    try {
        console.log("POST: likeTargetMember");
        const likeTargetId = req.params.id;
        const member = await likeService.likeTargetMember(req.member as Member, likeTargetId);
        res.status(HttpCode.OK).json({ value: member })
    } catch (err: any) {
        console.log(`Error: likeTargetMember, ${err.message}`);
        res.status(HttpCode.BAD_REQUEST).json({ code: HttpCode.BAD_REQUEST, message: err.message })
    }
}

export default memberController