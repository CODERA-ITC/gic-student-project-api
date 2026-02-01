import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Project } from '../project/entities/project.entity'
import { ProjectModule } from '../project/project.module'
import { User } from '../user/entities/user.entity'
import { CourseController } from './course.controller'
import { CourseService } from './course.service'
import { Course } from './entities/course.entity'
import { HttpModule } from '@nestjs/axios'
import { CourseClient } from './course.client'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      User,
      Project,
    ]),
    ProjectModule,
    HttpModule
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseClient],
  exports: [CourseClient]
})
export class CourseModule { }
