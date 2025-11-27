import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({example: 'Teacher'})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({example: 'Approve or dissaprove project proposals'})
    @IsOptional()
    @IsString()
    @MaxLength(300)
    description: string;
}
