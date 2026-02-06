import type { EntityManager, Repository } from 'typeorm'
import type { CreateFeatureDto } from './dto/create-feature.dto'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { CourseClient } from '../course/course.client'
import { DepartmentClient } from '../department/department.client'
import { ImageService } from '../image/image.service'
import { NotificationService } from '../notification/notification.service'
import { UserClient } from '../user/user.client'
import { parseProjectPaginationDto, ProjectPaginateDto } from './dto/paginate-project.dto'
import { FeatureStatus, UpdateFeatureDto, UpdateFeatureStatusDto } from './dto/update-feature.dto'
import { Category } from './entities/category.entity'
import { Feature } from './entities/feature.entity'
import { ProjectLike } from './entities/project-like.entity'
import { ProjectMember } from './entities/project-members.entity'
import { Project } from './entities/project.entity'
import { Tag } from './entities/tag.entity'

// TODO FIX NOTIFICATION

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(Feature)
    private featureRepo: Repository<Feature>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(ProjectLike)
    private projectLikeRepo: Repository<ProjectLike>,
    @InjectEntityManager()
    private entityManager: EntityManager, // for db transaction
    private notificationService: NotificationService,
    private imageService: ImageService,
    private configService: ConfigService,
    private userClient: UserClient,
    private departmentClient: DepartmentClient,
    private courseClient: CourseClient,
  ) {}

  async create(dto: CreateProjectDto, images: Express.Multer.File[]): Promise<any> {
    // tem shorts for TransactionEntityManager
    const project = await this.entityManager.transaction(async (tem) => {
      // Fetch related entities in parallel
      const [author, category, department, course] = await Promise.all([
        this.userClient.findOne(dto.authorId),
        tem.findOneBy(Category, { id: dto.categoryId }),
        this.departmentClient.findOne(dto.departmentId),
        this.courseClient.findOne(dto.courseId),
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
        courseId: course.id,
        departmentId: department.id,
        members: [],
        visibility: 'public', // default should be private in prod
        status: 'draft',
        tags,
        features,
      })

      const pmAuthor = this.projectMemberRepo.create({
        userId: author.id,
        role: 'author',
      })

      const uniqueMemberIds = [...new Set(dto.memberIds)]
      const pmMembers = uniqueMemberIds.map(id =>
        this.projectMemberRepo.create({
          userId: id,
          role: 'member',
        }),
      )

      // Add author as project member
      project.members.push(pmAuthor, ...pmMembers)

      // Save project with all relations
      return await tem.save(project)
    })

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

  async findOne(projectId: string) {
    const project = await this.findOneWithRelations(projectId)

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    return project
    // return project
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOneBy({ id })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const { memberIds, authorId, categoryId, tags, ...updated } = dto
    const updatedProject = this.projectRepo.merge(project, updated)

    return await this.projectRepo.save(updatedProject)
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
      .leftJoinAndSelect('p.tags', 'tags')
      .leftJoinAndSelect('p.features', 'features')
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
          userId,
        },
        relations: {
          project: {
            images: true,
            category: true,
            tags: true,
            features: true,
            members: true,
          },
        },
      },
    )

    const result = await Promise.all(members.map((member) => {
      const project = member.project

      return this.getProjectResponse(project)
    }))

    return result
  }

  // May need to find better impl to check authorId
  async addMember(projectId: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: {
        id: true,
        members: {
          id: true,
          role: true,
          userId: true,
        },
      },
    })

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    let memberExists = false

    for (const pm of project.members) {
      if (pm.userId === userId) {
        memberExists = true
        break
      }
    }

    if (memberExists) {
      throw new HttpException('Member already exists', HttpStatus.BAD_REQUEST)
    }

    const user = await this.userClient.findOneOrNull(userId)
    if (!user) {
      throw new HttpException('User doesn\'t exist', HttpStatus.BAD_REQUEST)
    }

    const member = this.projectMemberRepo.create()
    member.project = project
    member.userId = userId
    member.role = 'member'

    const result = await this.projectMemberRepo.save(member)
    return result
  }

  // userIds are the ids of the members
  async addMembers(projectId: string, userIds: string[]) {
    return this.entityManager.transaction(async (manager) => {
      const repo = manager.getRepository(ProjectMember)

      // 1. Normalize input
      const uniqueUserIds = [...new Set(userIds)]

      // 2. Build rows
      const rows = uniqueUserIds.map(userId => ({
        project: { id: projectId },
        userId,
        role: 'member',
      }))

      // 3. Bulk insert with conflict ignore (Postgres)
      const result = await repo
        .createQueryBuilder()
        .insert()
        .into(ProjectMember)
        .values(rows)
        .orIgnore() // <- ignores duplicates safely
        .execute()

      return {
        attempted: uniqueUserIds.length,
        inserted: result.identifiers.length,
      }
    })
  }

  async removeMember(projectId: string, userId: string) {
    const member = await this.projectMemberRepo.findOneOrFail({
      where: {
        project: { id: projectId },
        userId,
        // role: 'member',
      },
    })

    const result = await this.projectMemberRepo.remove(member)

    return {
      message: 'Member removed',
      data: result,
    }
  }

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

  async submitProjectForReview(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['members', 'members.member', 'category', 'department'],
    })

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    if (project.status !== 'draft') {
      throw new HttpException(
        'Only draft projects can be submitted for review',
        HttpStatus.BAD_REQUEST,
      )
    }

    project.status = 'pending'

    // TODO Fix notification
    // try {
    //   const notificationDto: CreateNotificationDto = {
    //     name: `${project.name}`,
    //     description: `${project.description}`,
    //     status: 'pending',
    //     read: false,
    //   }

    //   const notification = await this.notificationService.notifyTeachers(notificationDto)

    //   project.notificationId = notification.id
    // }
    // catch (error) {
    //   console.error('Failed to send notification to teachers: ', error)
    // }

    return await this.projectRepo.save(project)
  }

  // Accept or reject project (Teacher Role)
  async acceptProject(projectId: string, teacherId: string) {
    const project = await this.findOneWithRelations(projectId)

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    project.status = 'accepted'
    project.reviewedBy = teacherId
    await this.projectRepo.save(project)

    // TODO FIX NOTIFICATION
    // if (project.notificationId) {
    //   try {
    //     await this.notificationService.updateStatus(project.notificationId, 'accepted')
    //   }
    //   catch (error) {
    //     console.error('Failed to update notification status', error)
    //   }
    // }

    // try {
    //   const memberIds = project.members.map(m => m.userId)
    //   const notificationDto: CreateNotificationDto = {
    //     name: 'Project Accepted',
    //     description: `Your '${project.name}' prroposal has been accepted!`,
    //     status: 'accepted',
    //     read: false,
    //   }

    //   for (const memberId of memberIds) {
    //     await this.notificationService.notifyStudent(memberId, notificationDto)
    //   }
    // }
    // catch (error) {
    //   console.error('Failed to notify project members: ', error)
    // }

    return this.getProjectResponse(project)
  }

  async rejectProject(projectId: string, teacherId: string) {
    const project = await this.findOneWithRelations(projectId)

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND)
    }

    project.status = 'rejected'
    project.reviewedBy = teacherId
    await this.projectRepo.save(project)

    // TODO FIX NOTIFICATION
    // if (project.notificationId) {
    //   try {
    //     await this.notificationService.updateStatus(project.notificationId, 'rejected')
    //   }
    //   catch (error) {
    //     console.error('Failed to update notification status', error)
    //   }
    // }

    // try {
    //   const memberIds = project.members.map(m => m.userId)
    //   const notificationDto: CreateNotificationDto = {
    //     name: 'Project Rejected',
    //     description: `Your '${project.name}' prroposal has been rejected! Contact lecturer for further informations`,
    //     status: 'rejected',
    //     read: false,
    //   }

    //   for (const memberId of memberIds) {
    //     await this.notificationService.notifyStudent(memberId, notificationDto)
    //   }
    // }
    // catch (error) {
    //   console.error('Failed to notify project members: ', error)
    // }

    return this.getProjectResponse(project)
  }

  async incrementViewCount(projectId: string) {
    // Check if project exists
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    })
    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return await this.projectRepo.increment({ id: projectId }, 'viewCount', 1)
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

  // /**
  //  * Check if a user has viewed a project
  //  */
  // async hasUserViewedProject(projectId: string, userId?: string): Promise<boolean> {
  //   if (!userId) {
  //     return false
  //   }
  //   const view = await this.projectViewRepo.findOne({
  //     where: { userId, projectId },
  //   })
  //   return !!view
  // }

  async toggleProjectLike(projectId: string, userId: string) {
    // Check if user already liked this project
    const existingLike = await this.projectLikeRepo.findOne({
      where: {
        userId,
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
      const projectLike = this.projectLikeRepo.create({
        userId,
        project: { id: projectId },
      })
      const result = await this.projectLikeRepo.save(projectLike)

      // Increment the like count
      await this.projectRepo.increment(
        { id: projectId },
        'likeCount',
        1,
      )

      return result
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
        userId,
        project: { id: projectId },
      },
    })
    return !!like
  }

  async getLikedProjectsByUserId(userId: string) {
    const likedProjects = await this.projectLikeRepo.find({
      where: {
        userId,
      },
      relations: {
        project: {
          images: true,
          category: true,
          tags: true,
          features: true,
          members: true,
        },
      },
    })

    const result = await Promise.all(likedProjects.map(p => this.getProjectResponse(p.project)))
    return result
  }

  async getHighlightedProjects() {
    const options = this.getProjectResponseOptions()
    const projects = await this.projectRepo.find({
      where: { highlighted: true },
      ...options,
    })
    return await Promise.all(
      projects.map(p => this.getProjectResponse(p)),
    )
  }

  async getProjectResponse(project: Project) {
    const pmAuthor = project.members.find(m => m.role === 'author')
    const pmMember = project.members.filter(m => m.role === 'member')

    const author = await this.userClient.findOne(pmAuthor!.userId)
    let members = await Promise.all(
      pmMember.map(pm => this.userClient.findOneOrNull(pm.userId)),
    )
    members = members.filter(m => m !== null)

    // append avatarUrl to storage to get full url stored in bucket
    const storage = this.configService.get<string>('STORAGE_URL')
    const frontend = this.configService.get<string>('FRONTEND_HOST_URL')
    const href = `${frontend}/projects/${project.id}`

    const getPictureUrl = (path: string | null | undefined) => {
      let avatarUrl = ''

      if (!path) {
        return avatarUrl
      }
      // some seeded pictures have full URLs
      if (path?.includes('http')) {
        // It's already a full URL
        avatarUrl = path
      }
      else if (path) {
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

    const course = await this.courseClient.findOneOrNull(project.courseId)

    const transformed = {
      id: project.id,
      name: project.name,
      description: project.description,
      category: project.category,
      course: {
        id: project.courseId,
        name: course?.name,
        code: course?.code,
        description: course?.description,
      },
      startDate: project.startDate,
      highlighted: project.highlighted,
      academicYear: project.academicYear,
      technologies: project.technologies,
      visibility: project.visibility,
      status: project.status,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      viewCount: project.viewCount,
      likeCount: project.likeCount,
      duration: project.duration,
      images,
      author: {
        id: author?.id,
        email: author?.email,
        firstName: author?.firstName,
        lastName: author?.lastName,
        role: author?.role,
        avatar: getPictureUrl(author?.avatarUrl),
      },
      members: members.map(member => ({
        id: member?.id,
        email: member?.email,
        firstName: member?.firstName,
        lastName: member?.lastName,
        role: member?.role,
        avatar: getPictureUrl(member?.avatarUrl),
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
      href,
    }
    return transformed
  }

  private async findOneWithRelations(id: string, where?: any) {
    const options = this.getProjectResponseOptions()
    return await this.projectRepo.findOne({
      where: { id, ...where },
      ...options,
    })
  }

  private getProjectResponseOptions() {
    return {
      relations: {
        images: true,
        members: true,
        features: true,
        tags: true,
        category: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        courseId: true,
        repoUrl: true,
        demoUrl: true,
        description: true,
        viewCount: true,
        likeCount: true,
        technologies: true,
        academicYear: true,
        highlighted: true,
        duration: true,
        visibility: true,
        status: true,
        images: {
          id: true,
          originalUrl: true, // Change from url to original_url
        },
        members: {
          id: true,
          role: true,
          userId: true,
        },
        tags: {
          id: true,
          name: true,
        },
      },
    }
  }
}
