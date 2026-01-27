import type { EntityManager, Repository } from 'typeorm'
import type { CreateFeatureDto } from './dto/create-feature.dto'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Course } from '../course/entities/course.entity'
import { Department } from '../department/entitites/department.entity'
import { ImageService } from '../image/image.service'
import { CreateNotificationDto } from '../notification/dto/create-notification.dto'
import { NotificationService } from '../notification/notification.service'
import { User } from '../user/entities/user.entity'
import { parseProjectPaginationDto, ProjectPaginateDto } from './dto/paginate-project.dto'
import { FeatureStatus, UpdateFeatureDto, UpdateFeatureStatusDto } from './dto/update-feature.dto'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { ProjectLike } from './entities/project-like.entity'
import { ProjectView } from './entities/project-view.entity'
import { Project } from './entities/project.entity'
import { ProjectMember } from './entities/project_members.entity'
import { Tag } from './entities/tag.entity'
import { ConfigService } from '@nestjs/config'
import path from 'path'

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
    private imageService: ImageService,
    private configService: ConfigService,
  ) { }

  async create(dto: CreateProjectDto, images: Express.Multer.File[]): Promise<any> {
    // tem shorts for TransactionEntityManager
    const project = await this.entityManager.transaction(async (tem) => {
      // Fetch related entities in parallel
      const [author, category, department, course] = await Promise.all([
        tem.findOneBy(User, { id: dto.authorId }),
        tem.findOneBy(Category, { id: dto.categoryId }),
        tem.findOneBy(Department, { id: dto.departmentId }),
        tem.findOneBy(Course, { id: dto.courseId }),
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

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND)
      }

      let tags: Tag[] = []
      if (dto.tags) {
        const tagNames = dto.tags.slice(0, 5)
        const tagPromises: Promise<Tag | null>[] = []

        for (const name of tagNames) {
          tagPromises.push(this.tagRepo.findOneBy({ name }))
        }

        tags = (await Promise.all(tagPromises)).filter(p => p != null)
      }

      const features = this.featureRepo.create(dto.features)

      // Create and setup project
      const project = this.projectRepo.create({
        ...dto,
        category,
        course,
        department,
        members: [],
        visibility: 'draft',
        tags,
        features,
      })

      const pmAuthor = this.projectMemberRepo.create({
        member: author,
        role: 'author',
      })

      // Add author as project member
      project.members.push(pmAuthor)

      // Save project with all relations
      return await tem.save(project)
    })

    try {
      await this.addMembers(project.id, dto.memberIds)
    }
    catch (e) {
      throw new HttpException(
        `Failed to add member to project: ${e}`,
        HttpStatus.BAD_REQUEST,
      )
    }

    if (images && images.length > 0) {
      try {
        await this.imageService.bulkUploadImages(images, project.id)
      }
      catch (e) {
        console.error(e)
      }
    }

    return await this.findOne(project.id)
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
        category: true,
        course: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        course: true,
        repoUrl: true,
        demoUrl: true,
        description: true,
        viewCount: true,
        technologies: true,
        academicYear: true,
        isFeatured: true,
        duration: true,
        images: {
          id: true,
          originalUrl: true, // Change from url to original_url
        },
        members: {
          id: true,
          role: true,
          member: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

    return await this.getProjectResponse(project)
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOneBy({ id })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // const updated = this.projectRepo.create(dto)

    const { memberIds, authorId, categoryId, tags, ...updated } = dto

    this.projectRepo.merge(project, updated)

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

  async delete(id: string) {
    const project = await this.projectRepo.findOne({
      where: {
        id,
      },
      relations: {
        images: true,
      },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const imageIds = project.images.map(p => p.id)
    if (imageIds && imageIds.length > 0) {
      await this.imageService.bulkDeleteImages(imageIds)
    }

    await this.projectRepo.remove(project)
    return project
  }

  async paginate(
    dto: ProjectPaginateDto,
  ) {
    const params = parseProjectPaginationDto(dto)
    const page = params.page ?? 1
    const limit = params.limit ?? 8
    const skip = (page - 1) * limit

    const orderBy = params.ascending ? 'ASC' : 'DESC'

    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category') // if you have category relation
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.members', 'pm')
      .leftJoinAndSelect('pm.member', 'member')
      .leftJoinAndSelect('p.tags', 'tags')
      .leftJoinAndSelect('p.features', 'features')
      .leftJoinAndSelect('p.course', 'course')
    // Filter by category
    if (params.categoryId) {
      qb.andWhere('p.categoryId = :catId', { catId: params.categoryId })
    }

    if (params.courseId) {
      qb.andWhere('p.courseId = :courseId', { courseId: params.courseId })
    }

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('p.name ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [projects, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy(`p.${params.sort}`, orderBy)
      .getManyAndCount()

    const transformed = await Promise.all(projects.map(
      project => this.getProjectResponse(project),
    ))

    return {
      data: transformed,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }

  async getProjectsByUserId(userId: string) {
    const members = await this.projectMemberRepo.find(
      {
        where: {
          member: {
            id: userId,
          },
        },
        relations: {
          member: true, // user
          project: {
            images: true,
            category: true,
            tags: true,
            features: true,
            course: true,
            members: {
              member: true,
            },
          },
        },
      },
    )

    // const result: any = members.map((member) => {
    //   const project = member.project

    //   return this.getProjectResponse(project)
    // })

    const result = await Promise.all(members.map((member) => {
      const project = member.project

      return this.getProjectResponse(project)
    }))

    return result
  }

  // Project Member Functions

  async addMember(projectId: string, memberId: string) {
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

  async addMembers(projectId: string, memberIds: string[]) {
    const results = await Promise.allSettled(
      memberIds.map(id => this.addMember(projectId, id)),
    )

    return {
      success: results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.project)[0],

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

  async findOneFeature(featureId: string): Promise<Feature> {
    const feature = await this.entityManager.getRepository(Feature).findOne({
      where: { id: featureId },
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
      if (userId) {
        const projectView = this.projectViewRepo.create({
          userId,
          projectId,
        })
        await this.projectViewRepo.save(projectView)
      }

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
  async hasUserViewedProject(projectId: string, userId?: string): Promise<boolean> {
    if (!userId) {
      return false
    }
    const view = await this.projectViewRepo.findOne({
      where: { userId, projectId },
    })
    return !!view
  }

  async trackProjectLike(projectId: string, userId?: string): Promise<{ liked: boolean }> {
    if (!userId) {
      throw new HttpException('Authentication required to like projects', HttpStatus.UNAUTHORIZED)
    }

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
        project: { id: projectId },
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
    }
    else {
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

  // ===============================
  // Get total likes for a project
  // ===============================
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

  // ====================================
  // Check if a user has liked a project
  // ====================================
  async hasUserLikedProject(projectId: string, userId?: string): Promise<boolean> {
    if (!userId) {
      return false
    }
    const like = await this.projectLikeRepo.findOne({
      where: {
        user: { id: userId },
        project: { id: projectId },
      },
    })
    return !!like
  }

  async getProjectResponse(project: Project) {
    const pmAuthor = project.members.find(m => m.role === 'author')
    const pmMember = project.members.filter(m => m.role === 'member')
    // append avatarUrl to storage to get full url stored in bucket
    const storage = this.configService.get<string>('STORAGE_URL')

    const getPictureUrl = (path: string | null | undefined) => {
      let avatarUrl = ''

      if (!path) {
        return avatarUrl
      }
      // some seeded pictures have full URLs
      if (path?.includes('http')) {
        // It's already a full URL
        avatarUrl = path
      } else if (path) {
        // It's a path that needs the storage prefix
        avatarUrl = `${storage}/${path}`
      }

      return avatarUrl
    }

    const images = await Promise.all(
      project.images.map(async (img) => {
        const [originalSigned, thumbnailSigned] = await Promise.all([
          this.imageService.getSignedUrl(img.originalUrl),
          this.imageService.getSignedUrl(img.thumbnailUrl),
        ])

        return {
          id: img.id,
          originalUrl: originalSigned,
          thumbnailUrl: thumbnailSigned,
        }
      }),
    )

    const transformed = {
      id: project.id,
      name: project.name,
      description: project.description,
      category: project.category,
      course: {
        id: project.course.id,
        name: project.course.name,
        code: project.course.code,
        description: project.course.description,
      },
      startDate: project.startDate,
      isFeatured: project.isFeatured,
      academicYear: project.academicYear,
      technologies: project.technologies,
      visibility: project.visibility,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      viewCount: project.viewCount,
      likeCount: project.likeCount,
      duration: project.duration,
      images,
      author: {
        id: pmAuthor?.member.id,
        email: pmAuthor?.member.email,
        firstName: pmAuthor?.member.firstName,
        lastName: pmAuthor?.member.lastName,
        role: pmAuthor?.member.role,
        avatarUrl: getPictureUrl(pmAuthor?.member.avatarUrl),
      },
      members: pmMember.map(pm => ({
        id: pm.member.id,
        email: pm.member.email,
        firstName: pm.member.firstName,
        lastName: pm.member.lastName,
        role: pm.role,
        avatarUrl: getPictureUrl(pm.member.avatarUrl),
      })),
      features: project.features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        status: f.status,
        icon: f.icon,
        date: f.doneAt,
      })),
      tags: project.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
      })),
    }
    return transformed
  }
}
