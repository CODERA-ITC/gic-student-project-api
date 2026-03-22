import { BadRequestException, Body, HttpException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { Repository } from 'typeorm'
import { CreateCategoryDto } from './dto/create-category.dto'
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

  async create(@Body() dto: CreateCategoryDto) {
    try {
      const result = await this.categoryRepo.insert(dto)

      return {
        ...result.generatedMaps[0],
        ...dto,
      }
    }
    catch (e) {
      throw new BadRequestException('Category may already exist')
    }
  }

  async update(id: string, @Body() dto: CreateCategoryDto) {
    try {
      return await this.categoryRepo.save({ id, ...dto })
    }
    catch (e) {
      throw new NotFoundException('Category not found')
    }
  }

  async delete(id: string) {
    try {
      const category = await this.categoryRepo.findOneOrFail({ where: { id } })
      return this.categoryRepo.remove(category)
    }
    catch (e) {
      throw new NotFoundException('Category not found')
    }
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
