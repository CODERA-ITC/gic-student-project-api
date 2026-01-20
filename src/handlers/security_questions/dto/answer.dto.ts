import { IsArray, IsString, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MultiSecurityQuestionDto {
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
