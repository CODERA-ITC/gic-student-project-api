import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import type { FeatureStatus } from '../entities/feature.entity'

export class CreateFeatureDto {
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

  @IsNotEmpty()
  @IsUUID()
  projectId: string
}
