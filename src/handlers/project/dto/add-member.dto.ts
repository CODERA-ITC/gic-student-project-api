import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString, IsUUID } from 'class-validator'

export class AddProjectMemberDto {
    @ApiProperty({
        description: 'ID of the project author (who is adding the member)',
        example: '11111111-1111-1111-1111-111111111111',
    })
    @IsString()
    authorId: string

    @ApiProperty({
        description: 'ID of the member to add to the project',
        example: ['22222222-2222-2222-2222-222222222222'],
    })
    @IsArray()
    memberIds: string[]
}
