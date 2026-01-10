import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { CreateFeatureDto } from './create-feature.dto'

export class CreateProjectDto {
  @ApiProperty({ example: 'My First Project' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string

  @ApiProperty({ example: 'A small personal project', required: false })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description: string

  @ApiProperty({ example: 1, required: true })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryId: number

  @ApiProperty({ example: ['React', 'JavaScript'], required: false, description: 'List of tag names. Maximum is 5.' })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsArray()
  @IsString({ each: true })
  tags: string[]

  @ApiProperty({ example: '1', required: true })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  departmentId: number

  @ApiProperty({ description: 'Author id', example: '11111111-1111-1111-1111-111111111111', required: true })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  authorId: string

  @ApiProperty({ required: false, example: '2025-12-16T10:30:00Z' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsISO8601()
  startDate: string

  @ApiProperty({
    required: false,
    example: <CreateFeatureDto[]>[{
      name: 'coolest feature ever',
      status: 'pending',
      icon: 'bruh',
      description: 'bogo sort',
    }],
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsArray()
  features: CreateFeatureDto[]

  @ApiProperty({ description: 'List of member ids', required: false, example: ['22222222-2222-2222-2222-222222222222'] })
  @IsArray()
  memberIds: string[]

  @ApiProperty({ description: 'List of technologies used (string)', required: false, example: ['VueJs'] })
  @Transform(({ value }) => JSON.parse(value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies: string[]

  @ApiProperty({ example: '2024-2025', required: false })
  @Type(() => String)
  @IsOptional()
  @IsString()
  academicYear: string

  @ApiProperty({ example: 'https://github.com/CODERA-ITC/gic-student-project-web', required: false })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  repoUrl: string

  @ApiProperty({ example: 'https://github.com/darororo/Ecommerce/deployments/github-pages', required: false })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  demoUrl: string
}
