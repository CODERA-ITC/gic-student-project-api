import type { EntityManager, Repository } from 'typeorm'
import type { CreateFeatureDto } from './dto/create-feature.dto'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { CreateNotificationDto } from '../notification/dto/create-notification.dto'
import { NotificationService } from '../notification/notification.service'
import { User } from '../user/entities/user.entity'
import { ProjectResponseDto } from './dto/project-reponse.dto'
import { UpdateFeatureDto } from './dto/update-feature.dto'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Feature)
    private featureRepo: Repository<Feature>,
    @InjectEntityManager()
    private entityManager: EntityManager, // for db transaction
    private notificationService: NotificationService,
  ) { }

  async create(dto: CreateProjectDto): Promise<any> {
    // tem shorts for TransactionEntityManager
    const project = await this.entityManager.transaction(async (tem) => {
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
        departments: [department],
        members: [],
        visibility: 'draft',
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

    const transformed: Partial<ProjectResponseDto> = {
      id: project.id,
      name: project.name,
      category: project.category,
      members: project.members.map(pm => ({
        id: pm.member.id,
        email: pm.member.email,
        firstname: pm.member.firstname,
        lastname: pm.member.lastname,
        role: pm.role,
      })),
    }

    return transformed
  }

  async submitProjectForReview(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.member', 'category', 'department'],
    })

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    if (project.visibility !== 'draft') {
      throw new HttpException(
        'Only draft projects can be submitted for review',
        HttpStatus.BAD_REQUEST,
      )
    }

    project.visibility = 'reviewing'

    // use to get author pfp later on
    const author = project.members.find(m => m.role === 'author')

    try {
      const notificationDto: CreateNotificationDto = {
        name: `${project.name}`,
        description: `${project.description}`,
        status: 'pending',
        read: false,
      }

      const notification = await this.notificationService.notifyTeachers(notificationDto)

      project.notificationId = notification.id
    }
    catch (error) {
      console.error('Failed to send notification to teachers: ', error)
    }

    return await this.projectRepo.save(project)
  }

  async findAll() {
    try {
      const projects = await this.projectRepo.find({
        relations: {
          images: true,
          members: {
            member: true,
          },
        },
        select: {
          id: true,
          name: true,
          category: true,
          images: {
            id: true,
            url: true,
          },
          members: {
            id: true,
            role: true,
            member: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      })

      const transformed: ProjectResponseDto[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        category: project.category,
        images: project.images.map(img => ({
          id: img.id,
          url: img.url,
        })),
        members: project.members.map(pm => ({
          id: pm.member.id,
          email: pm.member.email,
          firstname: pm.member.firstname,
          lastname: pm.member.lastname,
          role: pm.role,
        })),
      }))

      return transformed
    }

    catch (e) {
      throw new NotFoundException('Project not found')
    }
    // return this.projectRepo.find({ take: 20, order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: {
        images: true,
        members: {
          member: true,
        },
        features: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        images: {
          id: true,
          url: true,
        },
        members: {
          id: true,
          role: true,
          member: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    })

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    const transformed = {
      id: project.id,
      name: project.name,
      category: project.category,
      images: project.images.map(img => ({
        id: img.id,
        url: img.url,
      })),
      members: project.members.map(pm => ({
        id: pm.member.id,
        email: pm.member.email,
        firstname: pm.member.firstname,
        lastname: pm.member.lastname,
        role: pm.role,
        avatarUrl: pm.member.avatarUrl,
      })),
      features: project.features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        status: f.status,
      })),
    }

    return transformed
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(id)

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const updated = this.projectRepo.create(dto)

    return await this.projectRepo.save(updated)
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

  async addMember(projectId: string, authorId: string, memberId: string) {
    if (authorId === memberId) {
      throw new HttpException('Author cannot add himself to the project', HttpStatus.BAD_REQUEST)
    }

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: { members: { member: true } },
      select: {
        members: {
          id: true,
          role: true,
          member: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    let memberExists = false

    console.log(project.members)

    for (const pm of project.members) {
      console.log(`a:${pm.member.id}; b:${memberId}; ${pm.member.id === memberId}`)
      if (pm.member.id === memberId) {
        memberExists = true
        break
      }
    }

    if (memberExists) {
      throw new HttpException('Member already exists', HttpStatus.BAD_REQUEST)
    }

    const user = await this.userRepo.findOneBy({ id: memberId })
    if (!user) {
      throw new HttpException('User doesn\'t exist', HttpStatus.BAD_REQUEST)
    }

    const member = this.projectMemberRepo.create()
    member.project = project
    member.member = user
    member.role = 'member'

    const result = await this.projectMemberRepo.save(member)
    return result
  }

  async addMembers(projectId: string, authorId: string, memberIds: string[]) {
    const results = await Promise.allSettled(
      memberIds.map(id => this.addMember(projectId, authorId, id)),
    )

    return {
      success: results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.project),

      failed: results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason),
    }
  }

  async removeMember(projectId: string, authorId: string, memberId: string) {
    // cannot remove the author himself
    if (authorId === memberId) {
      throw new BadRequestException('Author cannot remove himself')
    }

    await this.projectMemberRepo.delete({
      project: { id: projectId },
      member: { id: memberId },
    })

    return { message: 'Member removed' }
  }

  // ==============================================================================
  // Project Feature Service
  // ==============================================================================

  async createFeature(projectId: string, dto: CreateFeatureDto): Promise<Feature> {
    const project = await this.projectRepo.findOneBy({ id: projectId })
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

  async updateFeature(featureId: string, dto: UpdateFeatureDto) {
    const feature = await this.featureRepo.findOne({ where: { id: featureId } })
    if (!feature) {
      throw new NotFoundException('Feature not found')
    }

    const updated = this.featureRepo.create({
      ...dto,
      id: featureId,
    })

    return await this.featureRepo.save(updated)
  }

  async updateFeatureStatus(featureId: string, status: 'ongoing' | 'pending' | 'done') {
    const feature = await this.featureRepo.findOne({ where: { id: featureId } })
    if (!feature) {
      throw new NotFoundException('Feature not found')
    }
    if (status === 'done') {
      feature.status = 'done'
      feature.doneAt = new Date()
    }
    else {
      feature.status = status
      feature.doneAt = null
    }

    return await this.featureRepo.save(feature)
  }

  async deleteFeature(featureId: string) {
    const feature = await this.featureRepo.findOne({ where: { id: featureId } })
    if (!feature) {
      throw new NotFoundException('Feature not found')
    }

    return await this.featureRepo.remove(feature)
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

  // Accept or reject project (Teacher Role)
  async acceptProject(projectId: string, teacherId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: { members: { member: true } },
    })

    console.log(project)

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    if (project.visibility !== 'reviewing') {
      throw new HttpException(
        'Only projects under review can be accepted',
        HttpStatus.BAD_REQUEST,
      )
    }

    project.visibility = 'accepted'
    project.reviewedBy = teacherId
    await this.projectRepo.save(project)

    if (project.notificationId) {
      try {
        await this.notificationService.updateStatus(project.notificationId, 'accepted')
      }
      catch (error) {
        console.error('Failed to update notification status', error)
      }
    }

    try {
      const memberIds = project.members.map(m => m.member.id)
      const notificationDto: CreateNotificationDto = {
        name: 'Project Accepted',
        description: `Your '${project.name}' prroposal has been accepted!`,
        status: 'accepted',
        read: false,
      }

      for (const memberId of memberIds) {
        await this.notificationService.notifyStudent(memberId, notificationDto)
      }
    }
    catch (error) {
      console.error('Failed to notify project members: ', error)
    }
  }

  async rejectProject(projectId: string, teacherId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.member'],
    })

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    if (project.visibility !== 'reviewing') {
      throw new HttpException(
        'Only projects under review can be accepted',
        HttpStatus.BAD_REQUEST,
      )
    }

    project.visibility = 'rejected'
    project.reviewedBy = teacherId
    await this.projectRepo.save(project)

    if (project.notificationId) {
      try {
        await this.notificationService.updateStatus(project.notificationId, 'rejected')
      }
      catch (error) {
        console.error('Failed to update notification status', error)
      }
    }

    try {
      const memberIds = project.members.map(m => m.member.id)
      const notificationDto: CreateNotificationDto = {
        name: 'Project Rejected',
        description: `Your '${project.name}' prroposal has been rejected! Contact lecturer for further informations`,
        status: 'rejected',
        read: false,
      }

      for (const memberId of memberIds) {
        await this.notificationService.notifyStudent(memberId, notificationDto)
      }
    }
    catch (error) {
      console.error('Failed to notify project members: ', error)
    }
  }
}
