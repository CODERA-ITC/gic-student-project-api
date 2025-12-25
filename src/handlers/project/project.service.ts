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
import { CreateTagDto } from './dto/create-tag.dto'
import { ProjectPaginateDto } from './dto/paginate-project.dto'
import { FeatureStatus, UpdateFeatureDto, UpdateFeatureStatusDto } from './dto/update-feature.dto'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'
import { Tag } from './entities/tag.entity'
import { ProjectView } from './entities/project-view.entity'
import { ProjectLike } from './entities/project-like.entity'

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
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(ProjectView)
    private projectViewRepo: Repository<ProjectView>,
    @InjectRepository(ProjectLike)
    private projectLikeRepo: Repository<ProjectLike>,
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

      const features = this.featureRepo.create(dto.features)
      project.features = features

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

    const transformed = {
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
      startDate: project.startDate.toISOString(),
      features: project.features.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        status: feature.status,
        icon: feature.icon,
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
          tags: true,
          features: true,
        },
        select: {
          id: true,
          name: true,
          category: true,
          images: {
            id: true,
            thumbnailUrl: true, //Change from url to thumbnail_url for findAll
          },
          features: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
          tags: {
            id: true,
            name: true,
          },
          startDate: true,
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

      const transformed: any[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        category: project.category,
        images: project.images.map(img => ({
          id: img.id,
          url: img.thumbnailUrl,
        })),
        members: project.members.map(pm => ({
          id: pm.member.id,
          email: pm.member.email,
          firstname: pm.member.firstname,
          lastname: pm.member.lastname,
          role: pm.role,
        })),
        features: project.features.map(feature => ({
          id: feature.id,
          name: feature.name,
          description: feature.description,
          status: feature.status,
        })),
        tags: project.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
        })),
        academicYear: project.startDate.getFullYear(),
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
        tags: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        viewCount: true,
        images: {
          id: true,
          originalUrl: true, //Change from url to original_url
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
        tags: {
          id: true,
          name: true,
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
      startDate: project.startDate,
      viewCount: project.viewCount,
      images: project.images.map(img => ({
        id: img.id,
        url: img.originalUrl,
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
      tags: project.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
      })),
    }

    return transformed
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOneBy({ id })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // const updated = this.projectRepo.create(dto)

    this.projectRepo.merge(project, dto)

    return await this.projectRepo.save(project)
  }

  async softDelete(id: string) {
    const project = await this.projectRepo.findOneBy({ id })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    await this.projectRepo.softDelete(id)
    return project
  }

  async paginate(
    params: ProjectPaginateDto,
  ) {
    const page = params.page ?? 1
    const limit = params.limit ?? 8
    const skip = (page - 1) * limit

    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c') // if you have category relation
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.members', 'pm')
      .leftJoinAndSelect('pm.member', 'member')
      .leftJoinAndSelect('p.tags', 'tags')
      .leftJoinAndSelect('p.features', 'features')
    // Filter by category
    if (params.categoryId) {
      qb.andWhere('p.categoryId = :cid', { cid: params.categoryId })
    }

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('p.name ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount()

    const transformed: any[] = data.map(project => ({
      id: project.id,
      name: project.name,
      category: project.category,
      images: project.images.map(img => ({
        id: img.id,
        url: img.thumbnailUrl,
      })),
      members: project.members.map(pm => ({
        id: pm.member.id,
        email: pm.member.email,
        firstname: pm.member.firstname,
        lastname: pm.member.lastname,
        role: pm.role,
      })),
      features: project.features?.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        status: feature.status,
      })),
      tags: project.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
      })),
      startDate: project.startDate,
      academicYear: project.startDate.getFullYear().toString(),
    }))

    return {
      data: transformed,
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

    for (const pm of project.members) {
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

  async updateFeatureStatus(featureId: string, dto: UpdateFeatureStatusDto) {
    const feature = await this.featureRepo.findOne({ where: { id: featureId } })
    if (!feature) {
      throw new NotFoundException('Feature not found')
    }

    switch (dto.status) {
      case FeatureStatus.DONE:
        if (!dto.doneAt) {
          throw new BadRequestException('doneAt: ISO8601 string is required for done status')
        }
        feature.status = 'done'
        feature.doneAt = new Date(dto.doneAt)
        break

      default: {
        feature.status = dto.status
        feature.doneAt = null
        break
      }
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

  async deleteTag(tagId: number) {
    const tag = await this.tagRepo.findOne({ where: { id: tagId } })
    if (!tag) {
      throw new NotFoundException('Tag not found')
    }
    return await this.tagRepo.remove(tag)
  }

  async findOneTag(id: number): Promise<Tag> {
    const tag = await this.entityManager.getRepository(Tag).findOne({
      where: { id },
      relations: ['project'],
    })
    if (!tag) {
      throw new NotFoundException('Tag not found')
    }
    return tag
  }

  //==================================
  //Track project view count
  //==================================
  async trackProjectView(projectId: string, userId: string): Promise<void> {
    // Check if project exists
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // Check if user has already viewed this project
    const existingView = await this.projectViewRepo.findOne({
      where: { userId, projectId },
    })

    // Only increment view count if this is a new view
    if (!existingView) {
      // Record the view - create entity instance
      const projectView = this.projectViewRepo.create({
        userId,
        projectId,
      })
      await this.projectViewRepo.save(projectView)

      // Increment the view count
      await this.projectRepo.increment(
        { id: projectId },
        'viewCount',
        1,
      )
    }
  }

  /**
   * Get total unique views for a project
   */
  async getProjectViewCount(projectId: string): Promise<number> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id', 'viewCount'],
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }
    return project.viewCount
  }

  /**
   * Check if a user has viewed a project
   */
  async hasUserViewedProject(projectId: string, userId: string): Promise<boolean> {
    const view = await this.projectViewRepo.findOne({
      where: { userId, projectId },
    })
    return !!view
  }

  //========================================================
  //PROJECT LIKE SERVICE
  //========================================================

  //==================================================
  //Toggle like on a project (like/unlike)
  //==================================================
  async trackProjectLike(projectId: string, userId: string): Promise<{ liked: boolean }> {
    // Check if project exists
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // Check if user already liked this project
    const existingLike = await this.projectLikeRepo.findOne({
      where: {
        user: { id: userId },
        project: { id: projectId }
      },
    })

    if (existingLike) {
      // Unlike: Remove the like record
      await this.projectLikeRepo.remove(existingLike)

      // Decrement the like count
      await this.projectRepo.decrement(
        { id: projectId },
        'likeCount',
        1,
      )

      return { liked: false }
    } else {
      // Like: Create new like record
      const user = await this.userRepo.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException('User not found')
      }

      const projectLike = this.projectLikeRepo.create({
        user,
        project,
      })
      await this.projectLikeRepo.save(projectLike)

      // Increment the like count
      await this.projectRepo.increment(
        { id: projectId },
        'likeCount',
        1,
      )

      return { liked: true }
    }
  }

  //===============================
  //Get total likes for a project
  //===============================
  async getProjectLikeCount(projectId: string): Promise<number> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['id', 'likeCount'],
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }
    return project.likeCount
  }


  //====================================
  //Check if a user has liked a project
  //====================================
  async hasUserLikedProject(projectId: string, userId: string): Promise<boolean> {
    const like = await this.projectLikeRepo.findOne({
      where: {
        user: { id: userId },
        project: { id: projectId }
      },
    })
    return !!like
  }
}
