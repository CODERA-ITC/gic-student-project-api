import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class QueryUserDto {
    @IsOptional()
    @IsString()
    search?: string // filter

    @IsOptional()
    @IsString()
    sortBy?: string // sorting field

    @IsOptional()
    @IsString()
    order?: 'ASC' | 'DESC' // sort direction

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number // limit results

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    page?: number // pagination (page index)
}
