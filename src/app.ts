import express, { Request, Response } from "express";
import morgan from "morgan"
import { MORGAN } from "./libs/config";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import CookieParser from "cookie-parser";
import cors from "cors"
import { Socket, Server } from "socket.io"
import http from "http"
import { Member } from "./libs/types/member/member";
import AuthService from "./model/Auth.service";
import { JwtPayload } from "jsonwebtoken";
import { InfoMessage, NewMessage } from "./libs/types/socket/message";

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan(MORGAN))
app.use(CookieParser())
app.use(
    cors({ origin: true, credentials: true })
)


app.use("/admin", adminRouter)
app.use("/", userRouter)

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: true }
})

const clients = new Map<Socket, Member | null>()
let totalClients = 0
const messageList: NewMessage[] = []

io.on("connection", async (server: Socket) => {
    try {
        console.log("--- SOCKET CONNECTION ---")
        totalClients++

        const token = server.request.headers.token;
        if (token) {
            const authService = new AuthService
            const member = await authService.retrieveToken(token as string) as Member
            clients.set(server, member)
            console.log(`--- SOCKET AUTH [${member.memberNick}] ----`)
        } else {
            clients.set(server, null)
            console.log(`--- SOCKET AUTH [GUEST}] ----`)
        }

        const infoMessage: InfoMessage = {
            event: "info",
            memberData: clients.get(server) as Member | null,
            totalClients: totalClients,
            action: "joined"
        }
        clients.forEach((member, client) => {
            if (client != server) {
                client.emit("infoMessage", JSON.stringify(infoMessage))
            }
        })

        server.on("message", (data) => {
            const msg = JSON.parse(data).text;
            const newMessage: NewMessage = {
                event: "message",
                memberData: clients.get(server) as Member | null,
                message: msg
            }
            messageList.push(newMessage);
            io.emit("message", JSON.stringify(messageList))
        })

        server.on("disconnect", () => {
            const infoMessage: InfoMessage = {
                event: "info",
                memberData: clients.get(server) as Member | null,
                totalClients: totalClients,
                action: "left"
            }
            clients.forEach((member, client) => {
                if (client != server) {
                    client.emit("infoMessage", JSON.stringify(infoMessage))
                }
            })
            console.log(`--- SOCKET DISCONNETED AUTH [${clients.get(server)?.memberNick ?? "GUEST"}}] ----`)
        })


    } catch (err: any) {
        console.log(err.message)
    }
})


export default server