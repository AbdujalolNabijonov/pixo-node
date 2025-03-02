import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { BUCKET_NAME, BUCKET_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, URL_DURATION } from "../libs/config"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 } from "uuid"
import path from 'path'
import sharp from "sharp"

const s3 = new S3Client({
    region: BUCKET_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
    },
})

class S3Service {
    constructor() { }

    async uploadImage(file: any) {
        const bufferFile = await sharp(file.buffer).resize({ height: 1920, width: 1080, fit: "contain" }).toBuffer()
        const randomName = this.formatImageName(file.originalname)
        const param = {
            Bucket: BUCKET_NAME,
            Key: randomName,
            Body: bufferFile,
            ContentType: file.mimetype
        }

        const command = new PutObjectCommand(param);
        await s3.send(command)
        return randomName
    }

    async getImageUrl(key: string): Promise<string> {
        const getCommand = {
            Bucket: BUCKET_NAME,
            Key: key
        }
        const command = new GetObjectCommand(getCommand)
        return await getSignedUrl(s3, command, { expiresIn: 3600 * URL_DURATION })
    }

    private formatImageName(imageName: string) {
        const format = path.parse(imageName).ext;
        const randomName = v4() + format
        return randomName
    }
}

export default S3Service
