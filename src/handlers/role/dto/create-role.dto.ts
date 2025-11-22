import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ example: 'Admin, Super Admin...' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string

    @ApiProperty({ example: 'Manage users' })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    description?: string
}