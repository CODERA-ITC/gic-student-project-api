import { Module } from '@nestjs/common';
import { SecurityQuestionsService } from './security_questions.service';
import { SecurityQuestionsController } from './security_questions.controller';

@Module({
  controllers: [SecurityQuestionsController],
  providers: [SecurityQuestionsService],
})
export class SecurityQuestionsModule {}
