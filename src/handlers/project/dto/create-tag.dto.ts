import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class createTagDto{
    @ApiProperty({
        description: 'Project Tag',
        example: 'Nestjs'
    })

    @IsNotEmpty()
    @IsString()
    name: string
}