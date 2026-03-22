import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { Repository } from 'typeorm'
import { CreateTagDto } from './dto/create-tag.dto'
import { Project } from './entities/project.entity'
import { Tag } from './entities/tag.entity'

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll() {
    return this.tagRepo.find()
  }

  async paginate(params: PaginationDto) {
    const page = params.page ?? 1
    const limit = params.limit ?? 8
    const skip = (page - 1) * limit

    const qb = this.tagRepo.createQueryBuilder('t')

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('t.name ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [tags, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('t.createdAt', 'DESC')
      .getManyAndCount()

    return {
      data: tags,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }

  async createTag(dto: CreateTagDto) {
    try {
      const result = await this.tagRepo.insert(dto)

      return {
        ...dto,
        ...result[0],
      }
    }
    catch (e) {
      throw new BadRequestException('Tag may already exist')
    }
  }

  async deleteTag(id: string) {
    const tag = await this.tagRepo.findOne({ where: { id } })
    if (!tag) {
      throw new NotFoundException('Tag not found')
    }
    return await this.tagRepo.remove(tag)
  }

  async findOneTag(id: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({
      where: { id },
      relations: ['project'],
    })
    if (!tag) {
      throw new NotFoundException('Tag not found')
    }
    return tag
  }

  async update(id: string, dto: CreateTagDto) {
    try {
      const tag = await this.tagRepo.findOneOrFail({ where: { id } })
      const updated = this.tagRepo.merge(tag, dto)
      return await this.tagRepo.save(updated)
    }
    catch (e) {
      throw new NotFoundException('Tag not found')
    }
  }
}
