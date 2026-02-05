import { Controller, Get, Query } from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { CourseClient } from './course.client'

@Controller('courses')
export class CourseController {
	constructor(private readonly courseClient: CourseClient) {}

	@Get()
	findAll(@Query() params: PaginationDto) {
		return this.courseClient.getCourses(params)
	}

	// @Roles(['TEACHER'])
	// @Get('submissions')
	// @UseGuards(JwtAuthGuard, RolesGuard)
	// getProjectsByCourse(
	// 	@CurrentUser() teacher: any,
	// 	@Query() params: PaginationDto,
	// ) {
	// 	return this.courseService.getProjectsForReview(teacher.id, params)
	// }
}
