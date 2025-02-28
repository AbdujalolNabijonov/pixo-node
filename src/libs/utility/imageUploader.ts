import multer from "multer"

const storage = multer.memoryStorage()
const uploader = multer({ storage: storage })
export default uploader