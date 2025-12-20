import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) { }

  async createRole(dto: CreateRoleDto) {
    try {
      const role = this.roleRepo.create(dto)
      return await this.roleRepo.save(role)
    } catch (error) {
      console.error('Error creating role: ', error.message);

      if (error.code === '23505') {
        throw new BadRequestException('Role already exists')
      }

      throw new BadRequestException('Failed to create role')
    }
  }

  async findAllRole() {
    try {
      const roles = await this.roleRepo.find({
        order: { createdAt: 'desc' }
      })

      return roles;
    } catch (error) {
      console.error('Error fetching roles: ', error.message);
      throw new InternalServerErrorException('Failed to fetch roles')
    }
  }

  async findOneRole(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async findRoleByName(name: string){
    const role = await this.roleRepo.findOne({where: {name}});

    if(!role){
      throw new NotFoundException('Role not found')
    }

    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.findOneRole(id);

    if (dto.name && dto.name !== role.name) { 
      const existing = await this.roleRepo.findOne({ where: { name: dto.name } });

      if (existing) {
        throw new BadRequestException('Role name already exists');
      }
    }

    Object.assign(role, dto);
    return await this.roleRepo.save(role);
  }

  async removeRole(id: string) {
    try {
      const role = await this.findOneRole(id);

      await this.roleRepo.softDelete({id: role.id})  
    } catch (error) {
      console.error('Error removing roles: ', error.message);
      throw new InternalServerErrorException('Failed to remove roles')
    }
  }
}
