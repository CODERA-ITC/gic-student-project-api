import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateDepartmentDto{
    @ApiProperty({example: 'Department of Information and Communication Engineering'})
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({example: 'GIC'})
    @IsNotEmpty()
    @IsString()
    @MaxLength(5)
    code: string;

    @ApiProperty({example: 'Computer focused department...'})
    @IsOptional()
    @IsString()
    @MaxLength(300)
    description?: string;
}