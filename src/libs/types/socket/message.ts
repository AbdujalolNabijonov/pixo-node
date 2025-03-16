import { Member } from "../member/member"

export interface InfoMessage {
    event: string
    memberData: Member | null
    totalClients: number
    action:string
}
export interface NewMessage{
    event:string,
    memberData:Member|null;
    message:string
}