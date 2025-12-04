import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { User } from '../user/entities/user.entity'
import { SeederController } from './seeder.controller'
import { SeederService } from './seeder.service'
import { Role } from '../role/entities/role.entity'

@Module({
  controllers: [SeederController],
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([Department, User, Category, Role])],
})
export class SeederModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) { }
  onModuleInit() {
    this.seederService.seedCategories()
    this.seederService.seedDepartment()
    this.seederService.seedUser()
    this.seederService.seedRole()
  }
}
