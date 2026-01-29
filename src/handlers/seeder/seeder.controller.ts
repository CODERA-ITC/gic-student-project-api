import { Controller } from '@nestjs/common'
import { SeederService } from './seeder.service'

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  // @Post('/seed-all')
  // @ApiOperation({ summary: 'Seed all preliminary data' })
  // async seedAll() {
  //   await this.seederService.seedDepartment()
  //   await this.seederService.seedCategories()
  //   await this.seederService.seedRole()
  //   await this.seederService.seedTeachers()
  //   await this.seederService.seedUser()

  //   return 'Seeded: Department, Categories, Roles, Teachers, Users'
  // }

  // @Post('/seed-categories')
  // async seedCategories() {
  //   return await this.seederService.seedCategories()
  // }

  // @Post('/seed-department')
  // seedDepartment() {
  //   return this.seederService.seedDepartment()
  // }

  // @Post('/seed-role')
  // seedRole() {
  //   return this.seederService.seedRole()
  // }

  // @Post('/seed-teachers')
  // seedTeachers() {
  //   return this.seederService.seedTeachers()
  // }

  // @Post('/seed-users')
  // seedUsers() {
  //   return this.seederService.seedUser()
  // }
}
