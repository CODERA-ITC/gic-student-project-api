import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString, IsUUID } from 'class-validator'

export class AddProjectFeatureDto {
    @ApiProperty({
        description: 'ID of the member to add to the project',
        example: ['22222222-2222-2222-2222-222222222222'],
    })
    @IsArray()
    projectId: string
}
