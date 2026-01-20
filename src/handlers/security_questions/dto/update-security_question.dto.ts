import { PartialType } from '@nestjs/swagger';
import { CreateSecurityQuestionDto } from './create-security_question.dto';

export class UpdateSecurityQuestionDto extends PartialType(CreateSecurityQuestionDto) {

}
