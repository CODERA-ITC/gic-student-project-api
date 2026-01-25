import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
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

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111', required: true })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  categoryId: string

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111', required: true })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  courseId: string

  @ApiProperty({ example: ['React', 'JavaScript'], required: false, description: 'List of tag names. Maximum is 5.' })
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value)
      return json
    }
    catch (e) {
      return value
    }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[]

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111', required: true })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  departmentId: string

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
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value)
      return json
    }
    catch (e) {
      return value
    }
  })
  @IsOptional()
  @IsArray()
  features: CreateFeatureDto[]

  @ApiProperty({ description: 'List of member ids', required: false, example: ['22222222-2222-2222-2222-222222222222'] })
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value)
      return json
    }
    catch (e) {
      return value
    }
  })
  @IsOptional()
  @IsArray()
  memberIds: string[]

  @ApiProperty({ description: 'List of technologies used (string)', required: false, example: ['VueJs'] })
  @Transform(({ value }) => {
    try {
      const json = JSON.parse(value)
      return json
    }
    catch (e) {
      return value
    }
  })
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

  @ApiProperty({ example: 'https://en.wikipedia.org/wiki/Doge_(meme)#/media/File:Original_Doge_meme.jpg', required: false })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  avatarUrl: string

  @ApiProperty({ example: '3 months', required: false })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  duration: string
}
