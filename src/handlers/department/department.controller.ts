import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentController {
    constructor(
        private readonly departmentService: DepartmentService
    ) { }

    @Post('create-dept')
    @ApiOperation({ summary: 'Create a new department' })
    async createDept(@Body() dto: CreateDepartmentDto) {
        try {
            const result = await this.departmentService.createDept(dto);

            return {
                success: true,
                message: 'Department created successfully',
                data: result
            }
        } catch (error) {
            console.error('Error: ', error.message)

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Failed to create department. Please try again')
        }
    }

    @Get()
    @ApiOperation({summary: 'Get all departments'})
    get() {
        return this.departmentService.listAllDept();
    }

    @Get(':id')
    @ApiOperation({summary: 'Get department by id'})
    getOne(@Param('id') id: string){
        return this.departmentService.findDeptById(id);
    }

    @Patch(':id')
    @ApiOperation({summary: 'Update department information'})
    editDept(@Param('id') id: string, @Body() dto: UpdateDepartmentDto){
        return this.departmentService.updateDept(id, dto)
    }
}
