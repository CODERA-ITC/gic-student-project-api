import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyRealStudentDto {
    @ApiProperty({ example: 'e20250001' })
    @IsNotEmpty()
    @IsString()
    studentId: string

    @ApiProperty({ example: 'អំ ជេដ្ឋាមានឫទ្ធ' })
    @IsNotEmpty()
    @IsString()
    nameKh: string

    @ApiProperty({ example: '3/28/2005' })
    @IsNotEmpty()
    @IsString()
    dob: string

    @ApiProperty({ example: '85939000' })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string
}   
