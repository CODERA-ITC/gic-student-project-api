import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CourseModule } from '../course/course.module'
import { DepartmentModule } from '../department/department.module'
import { Image } from '../image/entities/image.entity'
import { ImageModule } from '../image/image.module'
import { NotificationModule } from '../notification/notification.module'
import { UserModule } from '../user/user.module'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { ProjectLike } from './entities/project-like.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'
import { Tag } from './entities/tag.entity'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'
import { TagController } from './tag.controller'
import { TagService } from './tag.service'

@Module({
  controllers: [ProjectController, CategoryController, TagController],
  providers: [ProjectService, CategoryService, TagService],
  imports: [TypeOrmModule.forFeature([
    Project,
    Category,
    Tag,
    Feature,
    Image,
    ProjectMember,
    ProjectLike,
  ]), NotificationModule, ImageModule, UserModule, DepartmentModule, CourseModule],
  exports: [ProjectService],
})
export class ProjectModule {}
