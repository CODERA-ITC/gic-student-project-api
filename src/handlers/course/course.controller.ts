import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard'
import { RolesGuard } from '../user/auth/roles.guard'
import { CurrentUser } from '../user/decorator/current-user.decorator'
import { Roles } from '../user/decorator/roles.decorator'
import { CourseService } from './course.service'
import { AssignCourseDto } from './dto/assign-course.dto'
import { CreateCourseDto } from './dto/create-course.dto'

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto)
  }

  @Get()
  findAll(@Query() params: PaginationDto) {
    return this.courseService.paginate(params)
  }

  @Roles(['TEACHER'])
  @Get('submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getProjectsByCourse(@CurrentUser() teacher: any) {
    return this.courseService.getProjectsForReview(teacher.id)
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.courseService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
  //   return this.courseService.update(+id, updateCourseDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.courseService.remove(+id)
  // }

  @Post('/assign/teacher')
  assignTeacher(@Body() dto: AssignCourseDto) {
    return this.courseService.assignTeacher(dto)
  }

  @Delete('/remove/teacher')
  removeTeacher(@Body() dto: AssignCourseDto) {
    return this.courseService.removeTeacher(dto)
  }
}
