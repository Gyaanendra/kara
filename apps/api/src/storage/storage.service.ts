import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME || "kara-recordings";
    this.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "dummy",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "dummy",
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    });
  }

  async getPresignedUploadUrl(orgId: string, meetingId: string, filename = "audio.webm") {
    const key = `recordings/${orgId}/${meetingId}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: "audio/webm",
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 7200 });
    return { uploadUrl, bucket: this.bucket, key };
  }

  async getPresignedDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return { downloadUrl };
  }
}
