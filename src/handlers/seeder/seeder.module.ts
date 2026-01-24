import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Course } from '../course/entities/course.entity'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { Project } from '../project/entities/project.entity'
import { ProjectMember } from '../project/entities/project_members.entity'
import { Tag } from '../project/entities/tag.entity'
import { Role } from '../role/entities/role.entity'
import { User } from '../user/entities/user.entity'
import { SeederService } from './seeder.service'

@Module({
  controllers: [],
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([
    Department,
    User,
    Category,
    Role,
    Tag,
    Course,
    Project,
    ProjectMember,
  ])],
})
export class SeederModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}
  async onModuleInit() {
    await this.seederService.seedCourses()
    await this.seederService.seedCategories()
    await this.seederService.seedDepartment()
    await this.seederService.seedRole()
    await this.seederService.seedUser()
    await this.seederService.seedTags()
    await this.seederService.seedProjects()
  }
}
