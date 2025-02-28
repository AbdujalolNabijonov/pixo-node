import { HttpCode } from "../enums/httpCode.enum";
import { Message } from "../enums/message.enum";

export class Errors extends Error{
    public code: HttpCode;
    public message: Message;

    static standard = {
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG
    };

    constructor(statusCode: HttpCode, statusMessage: Message) {
        super();
        this.code = statusCode;
        this.message = statusMessage
    }
}