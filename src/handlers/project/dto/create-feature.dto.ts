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

  @ApiProperty({
    description: 'Feature Description',
    example: 'THE',
  })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty(
    {
      description: 'Feature Status: pending, ongoing, done',
      example: 'pending',
    },
  )
  @IsOptional()
  @IsEnum(['pending', 'ongoing', 'done'])
  status?: FeatureStatus

  @IsOptional()
  @IsString()
  icon?: string
}
