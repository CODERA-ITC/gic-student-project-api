import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    return await this.categoryRepo.find()
  }

  async paginate(params: PaginationDto) {
    const page = params.page ?? 1
    const limit = params.limit ?? 8
    const skip = (page - 1) * limit

    const qb = this.categoryRepo.createQueryBuilder('c')

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('c.name ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [categories, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('c.createdAt', 'DESC')
      .getManyAndCount()

    return {
      data: categories,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }
}
