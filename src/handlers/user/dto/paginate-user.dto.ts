import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { PaginationDto } from 'src/common/dto/pagination.dto'

export class PaginateUserDto extends PaginationDto {
	@ApiProperty({ example: '25', description: 'generation of the students' })
	@IsOptional()
	@Type(() => Number)
	generation: number
}
