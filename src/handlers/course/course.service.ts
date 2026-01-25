import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { Equal, In, Not, Repository } from 'typeorm'
import { Project } from '../project/entities/project.entity'
import { ProjectService } from '../project/project.service'
import { User } from '../user/entities/user.entity'
import { AssignCourseDto } from './dto/assign-course.dto'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { Course } from './entities/course.entity'

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private projectService: ProjectService,
  ) {}

  create(createCourseDto: CreateCourseDto) {
    return 'This action adds a new course'
  }

  async paginate(
    params: PaginationDto,
  ) {
    const page = params.page ?? 1
    const limit = params.limit ?? 8
    const skip = (page - 1) * limit

    const qb = this.courseRepo.createQueryBuilder('course')
    // Filter by category

    // Optional search (e.g., search by project name)
    if (params.search) {
      const term = `%${params.search.trim().toLowerCase()}%`
      qb.andWhere('course.name ILIKE :search', { search: term })
        .orWhere('course.code ILIKE :search', { search: term })
    }

    const [courses, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('course.createdAt', 'DESC')
      .getManyAndCount()

    return {
      data: courses,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} course`
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`
  }

  remove(id: number) {
    return `This action removes a #${id} course`
  }

  async assignTeacher(dto: AssignCourseDto) {
    const teacher = await this.userRepo.findOne(
      {
        where: { id: dto.teacherId },
        relations: ['courses'],
      },
    )
    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } })
    if (!course) {
      throw new NotFoundException('Course not found')
    }
    const alreadyAssigned = teacher.courses.some(c => c.id === dto.courseId)
    if (alreadyAssigned) {
      return teacher
    }

    teacher.courses.push(course)
    return this.userRepo.save(teacher)
  }

  async removeTeacher(dto: AssignCourseDto) {
    const teacher = await this.userRepo.findOne(
      {
        where: { id: dto.teacherId },
        relations: ['courses'],
      },
    )
    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }

    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } })
    if (!course) {
      throw new NotFoundException('Course not found')
    }

    const allCourses = teacher.courses

    teacher.courses = allCourses.filter(c => c.id !== course.id)

    return this.userRepo.save(teacher)
  }

  async getProjectsForReview(teacherId: string, status: 'pending' | 'ongoing' | 'done' = 'pending') {
    const teacher = await this.userRepo.findOneOrFail({
      where: {
        id: teacherId,
      },
      select: {
        courses: true,
      },
      relations: {
        courses: true,
      },
    })

    const allowedCourseIds: string[] = teacher.courses.map(c => c.id)
    if (!allowedCourseIds || allowedCourseIds.length < 0) {
      throw new UnauthorizedException('Unauthorized access to courses')
    }

    const projects = await this.projectRepo.find({
      where: {
        course: {
          id: In(allowedCourseIds),
        },
        visibility: Not(Equal('draft')),
      },
      relations: {
        members: {
          member: true,
        },
        images: true,
        category: true,
        tags: true,
        features: true,
        likes: true,
        department: true,
        course: true,
      },
    })

    const response = await Promise.all(
      projects.map(p => this.projectService.getProjectResponse(p)),
    )

    return response
  }
}
