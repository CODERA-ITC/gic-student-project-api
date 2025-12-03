import type { Repository } from 'typeorm'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from './entities/category.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'
import { Tag } from './entities/tag.entity'

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) { }

  async create(dto: CreateProjectDto): Promise<Project> {
    try {
      const project = this.projectRepo.create(dto)

      // Validate and attach category
      if (dto.categoryId) {
        const category = await this.categoryRepo.findOneBy({ id: dto.categoryId })
        if (!category) {
          throw new HttpException(
            'Category not found',
            HttpStatus.BAD_REQUEST,
          )
        }
        project.category = category
      }

      // Validate and attach department
      if (dto.departmentId) {
        const department = await this.departmentRepo.findOneBy({
          id: dto.departmentId,
        })
        if (!department) {
          throw new HttpException(
            'Department not found',
            HttpStatus.BAD_REQUEST,
          )
        }
        project.department = department
      }

      // const pMember = this.projectMemberRepo.create()

      // Save will insert + handle relations
      const projectResult = await this.projectRepo.save(project)

      return projectResult
    }
    catch (e) {
      throw new HttpException(
        e.message || 'Unable to create project',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async findAll() {
    try {
      // const projectWithMembers = await this.projectMemberRepo
      //   .createQueryBuilder('pm')
      //   .leftJoinAndSelect('pm.project', 'project')
      //   .leftJoinAndSelect('pm.member', 'user')
      //   .select([
      //     'project.id',
      //     'project.name',

      //     'pm.role',
      //     'user.id',
      //     'user.email',
      //     'user.firstname',
      //     'user.lastname',
      //   ])
      //   .getMany()

      const projects = await this.projectMemberRepo.find({
        relations: {
          member: true,
          project: {
            images: true,
          },
        },
      })

      return projects
    }

    catch (e) {
      throw new NotFoundException('Project not found')
    }
    // return this.projectRepo.find({ take: 20, order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    try {
      const project = await this.projectRepo.findOneBy({ id })
      if (!project) {
        throw new NotFoundException('Project not found')
      }
      const members = await this.projectMemberRepo
        .createQueryBuilder('pm')
        .leftJoinAndSelect('pm.member', 'user')
        .where('pm.projectId = :id', { id })
        .select([
          'pm.role',
          'user.id',
          'user.email',
          'user.firstname',
          'user.lastname',
        ])
        .getMany()

      return {
        ...project,
        members: {
          ...members,
        },
      }
    }
    catch (e) {
      throw new NotFoundException('Project not found')
    }
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

    // const test = this.projectRepo.find({
    //   where: {},
    //   skip,
    //   relations: {},

    // })

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

  // Project Member Functions

  async removeMember(projectId: string, userId: string, targetUserId: string) {
    // cannot remove the author himself
    if (targetUserId === userId) {
      throw new BadRequestException('Author cannot remove himself')
    }

    await this.projectMemberRepo.delete({
      project: { id: projectId },
      member: { id: targetUserId },
    })

    return { message: 'Member removed' }
  }
}
