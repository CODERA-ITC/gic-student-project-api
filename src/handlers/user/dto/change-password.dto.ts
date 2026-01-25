import { ApiProperty } from "@nestjs/swagger";
import { Matches, MinLength } from "class-validator";
import { MultiSecurityQuestionDto } from "src/handlers/security_questions/dto/answer.dto";

export class ChangePasswordDto extends MultiSecurityQuestionDto {
    @MinLength(8)
    @Matches(/^(?=.*[\W_]).{8,}$/, { message: 'Password must be at least 8 characters and contain at least one special character' })
    newPassword: string
}