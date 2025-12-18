import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = configService.get<string>('aws.region');
    const accessKeyId = configService.get<string>('aws.accessKey');
    const secretAccessKey = configService.get<string>('aws.secretAccessKey');
    const bucketName = configService.get<string>('aws.s3BucketName')
    
    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required AWS configuration');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
    });

    this.bucket = bucketName;
  }

  async uploadFile(file: Express.Multer.File, projectId: string): Promise<string> {
    const key = `project-images/original/${projectId}/${uuid()}${extname(file.originalname)}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })

    await this.s3Client.send(command);
    return key;
  }
}
