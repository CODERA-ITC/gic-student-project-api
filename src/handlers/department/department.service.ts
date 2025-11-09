import { Injectable } from '@nestjs/common';
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
        const department = this.departmentRepo.create(dto);
        return this.departmentRepo.save(department);
    }

    // =============
    // Read
    // =============
    async listAll(){
        return this.departmentRepo.find();
    }

    async findDeptById(id: string){
        return this.departmentRepo.findOne({ where: {id}});
    }

    // =============
    // Update
    // =============
    async updateDept(id: string, dto: UpdateDepartmentDto){
        await this.departmentRepo.update(id, dto);
        return this.findDeptById(id);
    }
}
