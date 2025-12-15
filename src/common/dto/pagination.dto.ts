import { ApiProperty, ApiQuery } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

@ApiQuery({ name: 'filter' })
export class PaginationDto {
    @ApiProperty(
        {
            description: 'page number',
            default: null,
            required: false,
            type: 'number',
        },
    )
    @IsOptional()
    @Type(() => Number)

    @IsNumber()
    page: number | null

    @ApiProperty(
        {
            description: 'size to return',
            default: null,
            required: false,
            type: 'number',
        },
    )
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit: number | null

    @ApiProperty(
        {
            description: 'search terms',
            default: null,
            required: false,
            type: 'string',
        },
    )
    @IsOptional()
    @Type(() => String)
    @IsString()
    search: string | null
}
