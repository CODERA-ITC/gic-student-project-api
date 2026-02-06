import { Controller, Get, Param, Query } from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { CourseClient } from './course.client'

@Controller('courses')
export class CourseController {
	constructor(private readonly courseClient: CourseClient) {}

	@Get()
	findAll(@Query() params?: PaginationDto) {
		return this.courseClient.findAll(params)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.courseClient.findOne(id)
	}
}
