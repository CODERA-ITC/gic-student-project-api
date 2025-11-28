import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { Project } from './entities/project.entity'
import { Tag } from './entities/tag.entity'
import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [TypeOrmModule.forFeature([Project, Category, Tag])],

})
export class ProjectModule { }
