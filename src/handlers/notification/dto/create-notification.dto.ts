import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateNotificationDto {
    @ApiProperty({example: 'E-Commerce Website'})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({example: ''})
    description: string;

    status: 'pending' | 'rejected' | 'accepted';
}
