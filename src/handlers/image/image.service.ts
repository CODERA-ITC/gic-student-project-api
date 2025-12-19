import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = configService.get<string>('aws.region');
    const accessKeyId = configService.get<string>('aws.accessKey');
    const secretAccessKey = configService.get<string>('aws.secretAccessKey');
    const bucketName = configService.get<string>('aws.s3BucketName');

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

  async uploadImage(file: Express.Multer.File, projectId: string): Promise<{ originalKey: string, thumbnailKey: string }> {
    if (!file) throw new BadRequestException('File not found');

    const fileExt = extname(file.originalname);
    const baseName = uuid();

    const originalKey = `project-images/original/${projectId}/${baseName}${fileExt}`;
    const thumbnailKey = `project-images/thumbnail/${projectId}/${baseName}${fileExt}`;

    const originalCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: originalKey,
      Body: file.buffer,
      ContentType: file.mimetype
    });
    await this.s3Client.send(originalCommand);

    const thumbnailBuffer = await sharp(file.buffer).jpeg({ quality: 70 }).toBuffer();

    const thumbnailCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: file.mimetype
    });
    await this.s3Client.send(thumbnailCommand);

    return {
      originalKey,
      thumbnailKey
    }
  }
}
