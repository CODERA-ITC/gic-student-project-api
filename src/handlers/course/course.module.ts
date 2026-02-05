import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { CourseClient } from './course.client'
import { CourseController } from './course.controller'

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [CourseController],
  providers: [CourseClient],
  exports: [CourseClient],
})
export class CourseModule {}
