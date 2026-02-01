import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entitites/department.entity';
import { HttpModule } from '@nestjs/axios';
import { DepartmentClient } from './department.client';

@Module({
  imports: [TypeOrmModule.forFeature([Department]), HttpModule],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentClient],
  exports: [DepartmentClient]
})
export class DepartmentModule { }
