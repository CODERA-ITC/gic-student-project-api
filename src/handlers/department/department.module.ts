import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { DepartmentClient } from './department.client'
import { DepartmentController } from './department.controller'

@Module({
  imports: [HttpModule],
  controllers: [DepartmentController],
  providers: [DepartmentClient],
  exports: [DepartmentClient],
})
export class DepartmentModule {}
