import { Injectable } from '@nestjs/common';
import { CreateSecurityQuestionDto } from './dto/create-security_question.dto';
import { UpdateSecurityQuestionDto } from './dto/update-security_question.dto';

@Injectable()
export class SecurityQuestionsService {
  create(createSecurityQuestionDto: CreateSecurityQuestionDto) {
    return 'This action adds a new securityQuestion';
  }

  findAll() {
    return `This action returns all securityQuestions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} securityQuestion`;
  }

  update(id: number, updateSecurityQuestionDto: UpdateSecurityQuestionDto) {
    return `This action updates a #${id} securityQuestion`;
  }

  remove(id: number) {
    return `This action removes a #${id} securityQuestion`;
  }
}
