import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'

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
  categoryId: number

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  tagId?: number

  @IsNumber()
  departmentId: number
}
