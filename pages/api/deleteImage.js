import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

const bucketName = 'asiarichbenthanh';

export default async function handle(req, res) {
    await mongooseConnect();
    await isAdminRequest(req, res);

    if (req.method !== 'DELETE') {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { imageName } = req.body;

    const client = new S3Client({
        region: 'ap-southeast-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }
    });

    try {
        await client.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: imageName,
        }));

        res.json({message: "Image deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "An error occurred"});
    }
}
