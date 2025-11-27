import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({ example: 'My First Project' })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({ example: 'A small personal project', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string
}
