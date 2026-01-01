import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
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
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => value?.trim())
  description?: string

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  tagId?: number

  @ApiProperty({ example: '1', required: true })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number

  @ApiProperty({ description: 'Author id', example: '11111111-1111-1111-1111-111111111111', required: true })
  @IsString()
  @IsNotEmpty()
  authorId: string

  @ApiProperty({ required: false, example: '2025-12-16T10:30:00Z' })
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
  @IsArray()
  features: CreateFeatureDto[]

  @ApiProperty({ description: 'List of member ids', required: false, example: ['22222222-2222-2222-2222-222222222222'] })
  @IsArray()
  members: string[]

  @ApiProperty({ description: 'List of technologies used (string)', required: false, example: ['VueJs'] })
  @IsOptional()
  @IsArray()
  technologies: string[]

  @ApiProperty({ example: '2024-2025', required: false })
  @IsOptional()
  @IsString()
  academicYear: string
}
