import { T } from "../libs/types/common";
import { Request, Response } from "express"
import { Member } from "../libs/types/member/member";
import MemberService from "../model/Member.service";
import { MemberInput, MemberLogInput } from "../libs/types/member/member.input";
import { HttpCode } from "../libs/enums/httpCode.enum";
import { Errors } from "../libs/Error/Error";
import { Message } from "../libs/enums/message.enum";

const memberController: T = {}
const memberService = new MemberService

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("POST: signup")
        const data: MemberInput = req.body;
        const file = req.file;
        if (file) {
            data.memberImage = file?.path
            console.log("file:", req.file)
        }
        const member: Member = await memberService.signup(data)
        res.status(HttpCode.CREATED).json({ member })
    } catch (err: any) {
        console.log(`Error: signup, ${err.message}`)
        const message = new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        res.status(HttpCode.BAD_REQUEST).json({ status: HttpCode.BAD_REQUEST, message })
    }
}

memberController.login = async (req: Request, res: Response) => {
    try {
        console.log("POST: login")
        const data: MemberLogInput = req.body;
        const member: Member = await memberService.login(data);
        res.status(HttpCode.FOUND).json({ member })
    } catch (err: any) {
        console.log(`Error: login, ${err.message}`)
        const message = new Errors(HttpCode.INTERNAL_SERVER_ERROR, err.message)
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ status: HttpCode.BAD_REQUEST, message })
    }
}

export default memberController