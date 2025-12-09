import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsIn } from "class-validator";

export class CreateNotificationDto {
    @ApiProperty({ example: 'E-Commerce Website' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'E-Commerce website centered around sneakers and street fashions',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 'pending',
        enum: ['pending', 'rejected', 'accepted'],
    })
    @IsString()
    @IsIn(['pending', 'rejected', 'accepted'])
    status: 'pending' | 'rejected' | 'accepted';

    @ApiProperty({ example: false })
    @IsBoolean()
    read: boolean;
}
