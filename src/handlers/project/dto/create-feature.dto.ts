import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { FeatureStatus } from '../entities/feature.entity'

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'HOLY MOLY',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsOptional()
  @IsEnum(['pending', 'ongoing', 'done'])
  status?: FeatureStatus

  @IsOptional()
  @IsString()
  icon?: string
}
