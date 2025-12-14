import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { CreateFeatureDto } from './create-feature.dto'

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {
}

export enum FeatureStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  DONE = 'done',
}

export class UpdateFeatureStatusDto {
  @ApiProperty({
    description: 'status: pending, ongoing, done',
    example: 'pending',
  })
  @IsEnum(FeatureStatus)
  status: FeatureStatus

  @ApiProperty({
    description: 'ISO8601 date string',
    example: '2024-12-25T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  doneAt: string | null
}
