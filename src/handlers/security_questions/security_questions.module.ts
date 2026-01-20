import { Module } from '@nestjs/common';
import { SecurityQuestionsService } from './security_questions.service';
import { SecurityQuestionsController } from './security_questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { SecurityQuestion } from './entities/security_question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityQuestion, User])],
  controllers: [SecurityQuestionsController],
  providers: [SecurityQuestionsService],
  exports: [SecurityQuestionsService]
})
export class SecurityQuestionsModule { }
