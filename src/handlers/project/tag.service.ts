import { Injectable, NotFoundException } from '@nestjs/common'
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

  // ================================
  //      Project Tag Service
  // ================================

  async createTag(projectId: string, dto: CreateTagDto): Promise<Tag> {
    const project = await this.projectRepo.findOneBy({ id: projectId })
    if (!project) {
      throw new NotFoundException('Project Not found')
    }

    let tag = await this.tagRepo.findOne({
      where: { name: dto.name },
      relations: ['projects'],
    })

    if (tag) {
      if (!tag.projects.some(p => p.id === projectId)) {
        tag.projects.push(project)
        return await this.tagRepo.save(tag)
      }
      return tag
    }

    tag = this.tagRepo.create({
      name: dto.name,
      projects: [project],
    })
    return await this.tagRepo.save(tag)
  }

  async deleteTag(tagId: string) {
    const tag = await this.tagRepo.findOne({ where: { id: tagId } })
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
}
