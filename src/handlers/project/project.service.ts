import type { Repository } from 'typeorm'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { take } from 'rxjs'
import { Project } from './entities/project.entity'

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private projectRepo: Repository<Project>) { }

  async create(dto: CreateProjectDto): Promise<Project> {
    const entity = this.projectRepo.create(dto)
    try {
      const result = await this.projectRepo.save(entity)
      return result
    }
    catch (e) {
      throw new Error(e)
    }
  }

  findAll() {
    return this.projectRepo.find({ take: 20, order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOneBy({ id })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return project
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.preload({
      id,
      ...dto,
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return this.projectRepo.save(project)
  }

  async softDelete(id: string) {
    const project = await this.projectRepo.findOneBy({ id })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    await this.projectRepo.softDelete(id)
    return project
  }

  async paginate(params: {
    page?: number
    limit?: number
    categoryId?: string
    search?: string
  }) {
    const page = params.page ?? 1
    const limit = params.limit ?? 8
    const skip = (page - 1) * limit

    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categories', 'c') // if you have category relation

    // Filter by category
    if (params.categoryId) {
      qb.andWhere('p.categoryId = :cid', { cid: params.categoryId })
    }

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('p.name ILIKE :search', { search: `%${params.search}%` })
    }

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount()

    return {
      data,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }
}
