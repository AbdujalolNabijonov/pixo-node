import jwt from "jsonwebtoken"
import { SERCET_TOKEN } from "../libs/config"
import { T } from "../libs/types/common"

class JwtAuth {
    secret_key: string
    constructor() {
        this.secret_key = SERCET_TOKEN
    }

    public async createToken(payload: T): Promise<string> {
        try {
            const token = await jwt.sign(payload, this.secret_key)
            return token
        } catch (err: any) {
            console.log(`Error: createToken, ${err.message}`)
            throw err
        }
    }
}

export default JwtAuth