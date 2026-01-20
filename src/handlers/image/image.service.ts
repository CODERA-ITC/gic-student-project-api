import { BadRequestException, Delete, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteObject$, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import * as sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { In, Repository } from 'typeorm';
import { Project } from '../project/entities/project.entity';

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {
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

  async uploadImage(file: Express.Multer.File, projectId: string) {
    if (!file) {
      throw new BadRequestException('File not found');
    }

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id']
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const fileExt = extname(file.originalname);
    const baseName = uuid();
    const originalKey = `project-images/${projectId}/original/${baseName}${fileExt}`;
    const thumbnailKey = `project-images/${projectId}/thumbnail/${baseName}${fileExt}`;

    const [thumbnailBuffer] = await Promise.all([
      sharp(file.buffer)
        .jpeg({ quality: 70 })
        .toBuffer(),
    ]);

    await Promise.all([
      this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: originalKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private'
      })),
      this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        ACL: 'private'
      }))
    ]);

    const image = await this.imageRepo.save({
      originalUrl: originalKey,
      thumbnailUrl: thumbnailKey,
      project: { id: projectId },
    });

    return {
      id: image.id,
      originalUrl: image.originalUrl,
      thumbnailUrl: image.thumbnailUrl,
      projectId,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }

  async bulkUploadImages(files: Express.Multer.File[], projectId: string) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id']
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const uploadPromises = files.map(async (file) => {
      const fileExt = extname(file.originalname);
      const baseName = uuid();
      const originalKey = `project-images/${projectId}/original/${baseName}${fileExt}`;
      const thumbnailKey = `project-images/${projectId}/thumbnail/${baseName}${fileExt}`;

      const thumbnailBuffer = await sharp(file.buffer)
        .jpeg({ quality: 70 })
        .toBuffer();

      await Promise.all([
        this.s3Client.send(new PutObjectCommand({
          Bucket: this.bucket,
          Key: originalKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'private'
        })),
        this.s3Client.send(new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          ACL: 'private'
        }))
      ]);

      return this.imageRepo.save({
        originalUrl: originalKey,
        thumbnailUrl: thumbnailKey,
        project: { id: projectId },
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      projectId,
      images: uploadedImages.map(image => ({
        id: image.id,
        originalUrl: image.originalUrl,
        thumbnailUrl: image.thumbnailUrl,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
      })),
      total: uploadedImages.length,
    };
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await this.imageRepo.findOne({
      where: { id: imageId }
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await Promise.all([
      this.deleteFromS3(image.originalUrl),
      this.deleteFromS3(image.thumbnailUrl),
    ]);

    await this.imageRepo.remove(image);
  }

  async bulkDeleteImages(imageIds: string[]): Promise<void> {
    if (!imageIds || imageIds.length === 0) {
      throw new BadRequestException('No image IDs provided');
    }

    const images = await this.imageRepo.find({
      where: { id: In(imageIds) }
    });

    if (images.length === 0) {
      throw new NotFoundException('No images found');
    }

    const keysToDelete = images.flatMap(image => [
      { Key: image.originalUrl },
      { Key: image.thumbnailUrl },
    ]);

    if (keysToDelete.length > 0) {
      await this.bulkDeleteFromS3(keysToDelete);
    }

    await this.imageRepo.remove(images);
  }

  // View image from our private bucket
  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  // Get viewable image
  async getImageUrl(imageId: string) {
    const image = await this.imageRepo.findOne({
      where: { id: imageId },
      relations: ['project']
    })

    if (!image) {
      throw new NotFoundException('Image Not Found')
    }

    const [originalUrl, thumbnailUrl] = await Promise.all([
      this.getSignedUrl(image.originalUrl),
      this.getSignedUrl(image.thumbnailUrl)
    ]);

    return {
      id: image.id,
      originalUrl,
      thumbnailUrl,
      projectId: image.project.id,
      expiresIn: 3600
    }
  }

  private async deleteFromS3(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command)
      console.log(`Deleted from s3: ${key}`)
    } catch (error) {
      console.error(`Error deleting ${key} from s3:`, error);
      throw new BadRequestException(`Failed to delete image from storage`);
    }
  }

  private async bulkDeleteFromS3(objects: { Key: string }[]): Promise<void> {
    try {
      const batchSize = 1000;

      for (let i = 0; i < objects.length; i += batchSize) {
        const batch = objects.slice(i, i + batchSize);

        const command = new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: batch,
            Quiet: true,
          },
        });

        const result = await this.s3Client.send(command);
        if (result.Errors && result.Errors.length > 0) {
          console.error('Failed to delete some object: ', result.Errors)
          throw new BadRequestException('Some images failed to delete from storage');
        }

        console.log(`Bulk deleted ${batch.length} objects from S3`);
      }
    } catch (error) {
      console.error('Error bulk deleting from S3:', error);
      throw new BadRequestException(`Failed to delete images from storage: ${error.message}`);
    }
  }

  async getImagesByProject(projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id']
    });

    if (!project) {
      throw new NotFoundException('Project Not Found');
    }

    const images = await this.imageRepo.find({
      where: { project: { id: projectId } },
      order: { createdAt: 'desc' }
    });

    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const [originalUrl, thumbnailUrl] = await Promise.all([
          this.getSignedUrl(image.originalUrl),
          this.getSignedUrl(image.thumbnailUrl),
        ]);

        return {
          id: image.id,
          originalUrl,
          thumbnailUrl,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt,
        };
      }),
    );

    return {
      projectId,
      images: imagesWithUrls,
      total: images.length,
      expiresIn: 3600,
    };
  }
}
