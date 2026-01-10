import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { SeederService } from './seeder.service'

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('/seed-all')
  @ApiOperation({ summary: 'Seed departments and categories' })
  async seedAll() {
    await this.seederService.seedDepartment()
    await this.seederService.seedCategories()

    return 'Seeded: Department, Categories'
  }

  @Post('/seed-categories')
  async seedCategories() {
    return await this.seederService.seedCategories()
  }

  @Post('/seed-department')
  seedDepartment() {
    return this.seederService.seedDepartment()
  }

  @Post('/seed-role')
  seedRole() {
    return this.seedRole()
  }
}
