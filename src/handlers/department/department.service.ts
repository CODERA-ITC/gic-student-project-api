import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entitites/department.entity';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private departmentRepo: Repository<Department>,
    ){}

    // =============
    // Create
    // =============
    async createDept(dto: CreateDepartmentDto){
        try{
            const department = this.departmentRepo.create(dto);
            return await this.departmentRepo.save(department)
        }catch(error){
            console.error('Error creating department: ', error.message);

            if (error.code = '23505'){ //postgres unique violation
                throw new BadRequestException('Department already exists');
            }

            throw new BadRequestException('Failed to create department. Please try again')
        }
    }

    // =============
    // Read
    // =============
    async listAllDept(){
        return this.departmentRepo.find();
    }

    async findDeptById(id: string){
        return this.departmentRepo.findOne({ where: {id}});
    }

    // =============
    // Update
    // =============
    async updateDept(id: string, dto: UpdateDepartmentDto){
        const result = await this.departmentRepo.update(id, dto);
        if(result.affected === 0) throw new NotFoundException('Department not found');
        return this.findDeptById(id);
    }
}
