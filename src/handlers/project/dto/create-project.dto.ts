import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({ example: 'My First Project' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string

  @ApiProperty({ example: 'A small personal project', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim())
  description?: string

  @ApiProperty({ example: 'category-id', required: true })
  @IsString()
  categoryId: number

  @ApiProperty({ example: 'tag-id', required: false })
  @IsOptional()
  @IsString()
  tagId?: number

  @IsString()
  departmentId: string
}
