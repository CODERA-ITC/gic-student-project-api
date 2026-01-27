import { ApiProperty, ApiQuery } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
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

    @ApiProperty({
        description: 'sort projects by: date, like, view',
        default: null,
        required: false,
        type: 'string',

    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    sort: string
}

export function parseProjectPaginationDto(dto: ProjectPaginateDto) {
    const orderValues = ['asc', 'ASC', 'desc', 'DESC']
    const sortValues = ['date', 'view', 'like']

    let orderBy: 'ASC' | 'DESC' = 'DESC'
    let sortBy = 'createdAt'

    if (dto.sort && sortValues.includes(dto.sort)) {
        switch (dto.sort) {
            case 'date':
                sortBy = 'createdAt'
                break
            case 'view':
                sortBy = 'viewCount'
                break
            case 'like':
                sortBy = 'likeCount'
                break
        }
    }

    const parsed: ProjectPaginateDto = {
        ...dto,
        sort: sortBy,
    }
    return parsed
}
