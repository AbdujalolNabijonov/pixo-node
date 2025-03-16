import { Member } from "../member/member"

export interface InfoMessage {
    event: string
    memberData: Member | null
    totalClients: number
    action: string
    date: Date
}
export interface NewMessage {
    event: string,
    memberData: Member | null;
    message: string
    date: Date
}