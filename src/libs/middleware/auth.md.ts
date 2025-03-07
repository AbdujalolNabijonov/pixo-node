import { Response, NextFunction } from 'express'
import { Errors } from '../Error/Error';
import { HttpCode } from '../enums/httpCode.enum';
import { Message } from '../enums/message.enum';
import AuthService from '../../model/Auth.service';
import { T } from '../types/common';
import { Member } from '../types/member/member';


export async function memberRetrieve(req: T, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED)
        }
        const authService = new AuthService()
        const member = await authService.retrieveToken(token)
        req.member = member as Member;
        next()
    } catch (err: any) {
        console.log(`Error: memberRetrieve, ${err.message}`)
        res.status(HttpCode.BAD_REQUEST).json({ status: HttpCode.BAD_REQUEST, message: err.message })
    }
}

export async function isMemberAuth(req: T, res: Response, next: NextFunction) {
    const token = req.cookies.accessToken;
    if (!token) {
        req.member = null;
        next()
    } else {
        const authService = new AuthService()
        const member = await authService.retrieveToken(token)
        req.member = member as Member;
        next()
    }

}
