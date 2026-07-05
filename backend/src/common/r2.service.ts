import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private s3Client: S3Client;

  constructor(private config: ConfigService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.config.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.get('R2_BUCKET_NAME'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make it public
    });

    await this.s3Client.send(command);

    // Return the public URL
    return `https://${this.config.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com/${this.config.get('R2_BUCKET_NAME')}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.get('R2_BUCKET_NAME'),
      Key: key,
    });

    await this.s3Client.send(command);
  }
}