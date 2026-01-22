import { IsArray, IsString, MinLength, MaxLength, ValidateNested, IsEmail, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MultiSecurityQuestionDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerItemDto)
    answers: AnswerItemDto[];
}

class AnswerItemDto {
    @IsString()
    questionId: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    answer: string;
}
