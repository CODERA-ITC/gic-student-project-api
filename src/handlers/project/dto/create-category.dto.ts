import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Create Project Category',
    example: 'Nestjs',
  })

  @IsNotEmpty()
  @IsString()
  name: string
}
