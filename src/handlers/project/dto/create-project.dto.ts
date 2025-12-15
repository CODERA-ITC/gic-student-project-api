import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'

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

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111', required: true })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  startDate: string
}
