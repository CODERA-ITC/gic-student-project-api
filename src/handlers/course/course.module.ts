import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../user/entities/user.entity'
import { CourseController } from './course.controller'
import { CourseService } from './course.service'
import { Course } from './entities/course.entity'

@Module({
  imports: [TypeOrmModule.forFeature([
    Course,
    User,
  ])],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
