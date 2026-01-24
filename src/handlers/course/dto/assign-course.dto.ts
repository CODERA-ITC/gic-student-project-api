import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class AssignCourseDto {
	@ApiProperty(
		{
			example: '11111111-1111-1111-1111-111111111111',
		},
	)
	@IsString()
	courseId: string

	@ApiProperty(
		{
			example: '44444444-4444-4444-4444-444444444444',
		},
	)
	@IsString()
	teacherId: string
}
