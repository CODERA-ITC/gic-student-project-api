import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { DepartmentClient } from './department.client'

@Controller('departments')
export class DepartmentController {
  constructor(
    private readonly departmentClient: DepartmentClient,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  async get() {
    const result = await this.departmentClient.findAll()
    return {
      success: true,
      message: 'Departments found',
      data: result,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id' })
  async getOne(@Param('id') id: string) {
    const result = await this.departmentClient.findOne(id)
    return {
      success: true,
      message: 'Department found',
      data: result,
    }
  }
}
