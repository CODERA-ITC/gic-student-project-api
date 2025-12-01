import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

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
      conflictPaths: ['id'],
    })

    return result
  }
}
