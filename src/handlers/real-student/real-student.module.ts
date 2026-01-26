import { Module } from '@nestjs/common';
import { RealStudentService } from './real-student.service';
import { RealStudentController } from './real-student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealStudent } from './entities/real-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RealStudent])],
  controllers: [RealStudentController],
  providers: [RealStudentService],
  exports: [RealStudentService]
})
export class RealStudentModule { }
