import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'
import { Department } from './entitites/department.entity'

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) { }

  // =============
  // Create
  // =============
  async createDept(dto: CreateDepartmentDto) {
    try {
      const department = this.departmentRepo.create(dto)
      return await this.departmentRepo.save(department)
    }
    catch (error) {
      console.error('Error creating department: ', error.message)

      if (error.code = '23505') { // postgres unique violation
        throw new BadRequestException('Department already exists')
      }

      throw new BadRequestException('Failed to create department. Please try again')
    }
  }

  async findAllDept() {
    try {
      const departments = await this.departmentRepo.find({
        order: { createdAt: 'desc' },
      })

      return departments
    }
    catch (error) {
      console.error('Error fetching departments: ', error.message)
      throw new InternalServerErrorException('Failed to fetch departments')
    }
  }

  async findOneDept(id: string) {
    const department = await this.departmentRepo.findOne({ where: { id } })

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`)
    }

    return department
  }

  async updateDept(id: string, dto: UpdateDepartmentDto) {
    const department = await this.findOneDept(id)
    const name = dto.name
    const code = dto.code

    // Check if name or code already exist in the database
    if ((dto.name && dto.name !== department.name)
      || (dto.code && dto.code !== department.code)) {
      const existing = await this.departmentRepo.findOne({
        where: [
          { name, id: Not(department.id) },
          { code, id: Not(department.id) },
        ],
      })

      if (existing) {
        throw new BadRequestException('Department name or code already exists')
      }
    }

    Object.assign(department, dto)
    return await this.departmentRepo.save(department)
  }

  async removeDepartment(id: string) {
    try {
      const department = await this.findOneDept(id)

      await this.departmentRepo.softDelete({ id: department.id })
    }
    catch (error) {
      console.error('Error removing department: ', error.message)
      throw new InternalServerErrorException('Failed to remove department')
    }
  }
}
