import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  async createRole(@Body() dto: CreateRoleDto) {
    const result = await this.roleService.createRole(dto);
    return {
      success: true,
      message: 'Role created successfully',
      data: result
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all role' })
  async findAllRole() {
    const result = await this.roleService.findAllRole();
    return {
      success: true,
      message: 'Roles found',
      data: result
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one role' })
  async findOneRole(@Param('id') id: string) {
    const result = await this.roleService.findOneRole(id);
    return {
      success: true,
      message: 'Role found',
      data: result
    }

  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit role' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const result = await this.roleService.updateRole(id, dto);
    return {
      success: true,
      message: 'Updated Successfully',
      data: result
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id') id: string) {
    await this.roleService.removeRole(id);
    return {
      success: true,
      message: 'Role deleted successfully'
    }
  }
}
