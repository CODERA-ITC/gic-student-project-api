import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { Image } from './entities/image.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'
import { Tag } from './entities/tag.entity'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'

@Module({
  controllers: [ProjectController, CategoryController],
  providers: [ProjectService, CategoryService],
  imports: [TypeOrmModule.forFeature([
    Project,
    Category,
    Tag,
    Department,
    Feature,
    Image,
    ProjectMember,
  ])],

})
export class ProjectModule { }
