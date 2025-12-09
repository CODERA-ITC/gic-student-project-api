import type { EntityManager, Repository } from 'typeorm'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import type { CreateFeatureDto } from './dto/create-feature.dto'
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { User } from '../user/entities/user.entity'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'
import { Tag } from './entities/tag.entity'
import { NotificationService } from '../notification/notification.service'
import { CreateNotificationDto } from '../notification/dto/create-notification.dto'

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
    @InjectEntityManager()
    private entityManager: EntityManager, // for db transaction


    private notificationService: NotificationService,
  ) { }

  async create(dto: CreateProjectDto): Promise<Project> {
    // tem shorts for TransactionEntityManager
    return await this.entityManager.transaction(async (tem) => {
      // Fetch related entities in parallel
      const [author, category, department] = await Promise.all([
        tem.findOneBy(User, { id: dto.userId }),
        tem.findOneBy(Category, { id: dto.categoryId }),
        tem.findOneBy(Department, { id: dto.departmentId }),
      ])

      // Validate all required entities exist
      if (!author) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND)
      }
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND)
      }
      if (!department) {
        throw new HttpException('Department not found', HttpStatus.NOT_FOUND)
      }

      // Create and setup project
      const project = this.projectRepo.create({
        ...dto,
        category,
        department,
        members: [],
      })

      const projectMember = this.projectMemberRepo.create({
        member: author,
        project,
        role: 'author',
      })
      // Add author as project member
      try {
        await tem.save(projectMember)
      }
      catch (e) {
        throw new HttpException(
          `Failed to add member to project`,
          HttpStatus.BAD_REQUEST,
        )
      }

      project.members.push(projectMember)

      // Save project with all relations
      return await tem.save(project)
    })
  }

  async createProjectAndNotify(projectDto: CreateProjectDto) {
    const project = await this.create(projectDto);

    try {
      const notificationDto: CreateNotificationDto = {
        name: projectDto.name,
        description: projectDto.description ?? 'New project',
        status: 'pending',
      };

      await this.notificationService.notifyTeachers(notificationDto);
    } catch (error) {
      // Log the error but don't fail the project creation
      console.error('Failed to send notification', error);
    }

    return project;
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
    const project = await this.projectRepo.findOneBy({ id })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const members = await this.projectMemberRepo
      .createQueryBuilder('pm')
      .leftJoin('pm.member', 'user')
      .where('pm.projectId = :id', { id })
      .select([
        'pm.role as role',
      ])
      .addSelect([
        'user.id as id',
        'user.email as email',
        'user.firstname as firstname',
        'user.lastname as lastname',
      ])
      .getRawMany()

    return {
      project,
      members,
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

  // ==============================================================================
  // Project Feature Service
  // ==============================================================================
  
  async createFeature(dto: CreateFeatureDto): Promise<Feature> {
    const project = await this.projectRepo.findOneBy({ id: dto.projectId })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const feature = this.entityManager.getRepository(Feature).create({
      name: dto.name,
      description: dto.description,
      status: dto.status || 'pending',
      icon: dto.icon || '',
      project,
    })

    return await this.entityManager.save(feature)
  }

  async findAllFeatures(): Promise<Feature[]> {
    return await this.entityManager.getRepository(Feature).find({
      relations: ['project'],
      order: { createdAt: 'DESC' },
    })
  }

  async findOneFeature(id: string): Promise<Feature> {
    const feature = await this.entityManager.getRepository(Feature).findOne({
      where: { id },
      relations: ['project'],
    })

    if (!feature) {
      throw new NotFoundException('Feature not found')
    }

    return feature
  }

  async findFeaturesByProject(projectId: string): Promise<Feature[]> {
    const project = await this.projectRepo.findOneBy({ id: projectId })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return await this.entityManager.getRepository(Feature).find({
      where: { project: { id: projectId } },
      relations: ['project'],
      order: { createdAt: 'ASC' },
    })
  }
}
