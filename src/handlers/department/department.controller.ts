import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { DepartmentService } from './department.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@Controller('departments')
export class DepartmentController {
    constructor(
        private readonly departmentService: DepartmentService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new department' })
    async createDept(@Body() dto: CreateDepartmentDto) {
        const result = await this.departmentService.createDept(dto)
        return {
            success: true,
            message: 'Department created successfully',
            data: result,
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all departments' })
    async get() {
        const result = await this.departmentService.findAllDept()
        return {
            success: true,
            message: 'Departments found',
            data: result,
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get department by id' })
    async getOne(@Param('id') id: number) {
        const result = await this.departmentService.findOneDept(id)
        return {
            success: true,
            message: 'Department found',
            data: result,
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update department information' })
    async editDept(@Param('id') id: number, @Body() dto: UpdateDepartmentDto) {
        const result = await this.departmentService.updateDept(id, dto)
        return {
            success: true,
            message: 'Department update successfully',
            data: result,
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete role' })
    async remove(@Param('id') id: number) {
        await this.departmentService.removeDepartment(id)
        return {
            success: true,
            message: 'Department deleted successfully',
        }
    }
}
