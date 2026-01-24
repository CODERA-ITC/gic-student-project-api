import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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
  ) {}

  create(createCourseDto: CreateCourseDto) {
    return 'This action adds a new course'
  }

  findAll() {
    return this.courseRepo.find()
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
}
