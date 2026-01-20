import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SecurityQuestionsService } from './security_questions.service';
import { CreateSecurityQuestionDto } from './dto/create-security_question.dto';
import { UpdateSecurityQuestionDto } from './dto/update-security_question.dto';

@Controller('security-questions')
export class SecurityQuestionsController {
  constructor(private readonly securityQuestionsService: SecurityQuestionsService) {}

  @Post()
  create(@Body() createSecurityQuestionDto: CreateSecurityQuestionDto) {
    return this.securityQuestionsService.create(createSecurityQuestionDto);
  }

  @Get()
  findAll() {
    return this.securityQuestionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.securityQuestionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSecurityQuestionDto: UpdateSecurityQuestionDto) {
    return this.securityQuestionsService.update(+id, updateSecurityQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.securityQuestionsService.remove(+id);
  }
}
