import app from "./app";
import { MONGODB, PORT } from "./libs/config";
import mongoose from "mongoose"

mongoose.set('strictQuery', true)
mongoose.connect(MONGODB as string).then(() => {
    app.listen(PORT || 3011)
    console.log(`Server is running successfully on http://localhost:${PORT}`)
}).catch((err: any) => {
    console.info(`MONGODB connection error!, ${err.message}`)
})