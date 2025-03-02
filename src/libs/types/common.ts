import { Request } from "express"
import { Member } from "./member/member"

export interface T {
    [key: string]: any
}

export interface RequestAuth extends Request {
    member: Member | null
}

export interface MetaCounter {
    total: number
}