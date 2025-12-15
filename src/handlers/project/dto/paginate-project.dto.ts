import { ApiProperty, ApiQuery } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'
import { PaginationDto } from 'src/common/dto/pagination.dto'

@ApiQuery({ name: 'filter' })
export class ProjectPaginateDto extends PaginationDto {
    @ApiProperty({
        description: 'category id',
        default: null,
        required: false,
        type: 'number',

    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    categoryId: number | null
}
