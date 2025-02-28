import { T } from "../libs/types/common";
import { Request, Response } from "express"

const memberController: T = {}

memberController.signup = async (req: Request, res: Response) => {
    try {
        console.log("POST: signup")
        res.send("Hello")
    } catch (err: any) {
        console.log(`Error: signup, ${err.message}`)
    }
}

export default memberController