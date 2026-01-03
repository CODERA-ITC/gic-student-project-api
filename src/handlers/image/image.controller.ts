import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ImageService } from './image.service';
import { ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) { }
  @Post('/upload/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Post project image' })
  async postImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('projectId') projectId: string
  ) {
    if (!file) {
      throw new BadRequestException('File not found');
    }
    return this.imageService.uploadImage(file, projectId);
  }

  @Delete('/:imageId')
  @ApiOperation({ summary: 'Delete an image' })
  async deleteImage(@Param('imageId') imageId: string) {
    return this.imageService.deleteImage(imageId);
  }

  @Get('/project/:projectId')
  @ApiOperation({ summary: 'Get all images for a project' })
  async getProjectImages(@Param('projectId') projectId: string) {
    return this.imageService.getImagesByProject(projectId);
  }

  @Get('/:imageId')
  @ApiOperation({ summary: 'Get image with viewable URLs' })
  async getImage(@Param('imageId') imageId: string) {
    return this.imageService.getImageUrl(imageId);
  }
}