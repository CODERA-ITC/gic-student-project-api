import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { CreateFeatureDto } from './create-feature.dto'

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {
}

export class UpdateFeatureStatusDto {
  @ApiProperty({
    description: 'status: pending, ongoing, done',
    example: 'pending',
  })
  @IsString()
  status: 'ongoing' | 'pending' | 'done'
}
