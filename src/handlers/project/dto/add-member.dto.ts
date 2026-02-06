import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator'

export class AddProjectMemberDto {
    @ApiProperty({
        description: 'IDs of users to add to the project',
        example: ['22222222-2222-2222-2222-222222222222'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    // @IsUUID('4', { each: true })
    @IsString({ each: true })
    userIds: string[]
}

export class RemoveProjectMemberDto {
    @ApiProperty({
        description: 'ID of the member to add to the project',
        example: ['22222222-2222-2222-2222-222222222222'],
    })
    @IsString()
    userId: string
}
