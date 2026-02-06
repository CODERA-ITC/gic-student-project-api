import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CourseModule } from '../course/course.module'
import { Category } from '../project/entities/category.entity'
import { ProjectMember } from '../project/entities/project-members.entity'
import { Project } from '../project/entities/project.entity'
import { Tag } from '../project/entities/tag.entity'
import { UserModule } from '../user/user.module'
import { SeederService } from './seeder.service'

@Module({
  controllers: [],
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([
    Category,
    Tag,
    Project,
    ProjectMember,
  ]), UserModule, CourseModule],
})
export class SeederModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}
  async onModuleInit() {
    await this.seederService.seedCategories()
    await this.seederService.seedTags()
    await this.seederService.seedProjects()
  }
}
