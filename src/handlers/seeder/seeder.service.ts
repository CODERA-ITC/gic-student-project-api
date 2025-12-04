import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { User } from '../user/entities/user.entity'
import { Role } from '../role/entities/role.entity'

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) { }

  async seedDepartment() {
    const gic = this.departmentRepo.create()
    gic.name = 'Department of Information and Communication Engineering'
    gic.code = 'GIC'
    const result = await this.departmentRepo.upsert(gic, { conflictPaths: ['code'] })
    return result
  }

  async seedCategories() {
    const result = await this.categoryRepo.upsert([
      { name: 'Web Development' },
      { name: 'AI' },
      { name: 'Mobile Development' },
    ], {
      conflictPaths: ['name'],
    })

    return result
  }

  async seedUser() {
    const userId = '11111111-1111-1111-1111-111111111111'
    const department = await this.departmentRepo.findOneBy({ id: 1 })
    const user = this.userRepo.create(
      {
        id: userId,
        firstname: 'Test',
        lastname: 'User',
        email: 'testuser@gmail.com',
        phone: '0123456789',
        password: 'super_secured_pass',
      },
    )

    user.department = department!

    const result = await this.userRepo.save(user)

    return result
  }

  async seedRole() {
    const result = await this.roleRepo.upsert([
      { 
        name: 'Admin',
        description: 'Responsible for managing the system'
      },
      {
        name: 'Teacher',
        description: 'Manage student projects'
      },
      {
        name: 'Student',
        description: 'Create and propose project ideas'
      }
    ], { conflictPaths: ['name'] })

    return result;
  }
}
