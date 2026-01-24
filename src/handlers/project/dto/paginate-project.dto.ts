import { ApiProperty, ApiQuery } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/common/dto/pagination.dto'

@ApiQuery({ name: 'filter' })
export class ProjectPaginateDto extends PaginationDto {
    @ApiProperty({
        description: 'category id',
        default: null,
        required: false,
        type: 'string',

    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    categoryId: string

    @ApiProperty({
        description: 'course id',
        default: null,
        required: false,
        type: 'string',

    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    courseId: string
}
