import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { Role } from '../role/entities/role.entity'
import { User } from '../user/entities/user.entity'

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
    const department = await this.departmentRepo.findOneBy({ id: 1 })
    const user = this.userRepo.create(
      {
        id: '11111111-1111-1111-1111-111111111111',
        firstname: 'Test',
        lastname: 'User',
        email: 'testuser@gmail.com',
        phone: '0123456789',
        password: 'super_secured_pass',
      },
    )

    user.department = department!

    const result = await this.userRepo.save(
      [
        {
          id: '11111111-1111-1111-1111-111111111111',
          firstname: 'Test',
          lastname: 'User',
          email: 'testuser@gmail.com',
          phone: '0123456789',
          password: 'super_secured_pass',
          department: department!,
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          firstname: 'Test',
          lastname: 'User',
          email: 'testuser2@gmail.com',
          phone: '0123456789',
          password: 'super_secured_pass',
          department: department!,
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          firstname: 'Test3',
          lastname: 'User3',
          email: 'testuser3@gmail.com',
          phone: '0123456789',
          password: 'super_secured_pass',
          department: department!,
        },
      ],
    )

    return result
  }

  async seedRole() {
    const result = await this.roleRepo.upsert([
      {
        name: 'ADMIN',
        description: 'Responsible for managing the system',
      },
      {
        name: 'TEACHER',
        description: 'Manage student projects',
      },
      {
        name: 'STUDENT',
        description: 'Create and propose project ideas',
      },
    ], { conflictPaths: ['name'] })

    return result
  }
}
