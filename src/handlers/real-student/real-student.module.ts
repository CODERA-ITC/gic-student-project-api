import { Module } from '@nestjs/common';
import { RealStudentService } from './real-student.service';
import { RealStudentController } from './real-student.controller';

@Module({
  controllers: [RealStudentController],
  providers: [RealStudentService],
})
export class RealStudentModule {}
