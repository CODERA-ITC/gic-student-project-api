import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
    ) { }

    // ==============
    // Create 
    // ==============
    async createRole(dto: CreateRoleDto) {
        const role = this.roleRepo.create(dto);
        return this.roleRepo.save(role);
    }

    // =============
    // Read
    // =============
    async listAll(){
        return this.roleRepo.find();
    }

    async findRoleById(id: string){
        return this.roleRepo.findOne({where: {id}})
    }

    // ============
    // Update
    // ============
    async updateRole(id: string, dto: UpdateRoleDto){
        await this.roleRepo.update(id, dto)
        return this.findRoleById(id);
    }

    // ============
    // Delete
    // ============
    async deleteRole(id: string){
        await this.roleRepo.delete(id);
    }
}
