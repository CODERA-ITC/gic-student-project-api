import { Controller, UploadedFile, BadRequestException, Post, UseInterceptors } from '@nestjs/common';
import { RealStudentService } from './real-student.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('real-student')
export class RealStudentController {
  constructor(private readonly realStudentService: RealStudentService) { }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async parseCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File not found")
    }

    return this.realStudentService.importCSV(file);
  }
}
