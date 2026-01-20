import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { MultiSecurityQuestionDto } from './dto/answer.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SecurityQuestion } from './entities/security_question.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SecurityQuestionsService {
  private readonly saltRounds: number;

  constructor(
    config: ConfigService,
    @InjectRepository(SecurityQuestion)
    private secureQuestionRepo: Repository<SecurityQuestion>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    this.saltRounds = Number(config.get('SALT_ROUNDS')) || 12;
  }



  private readonly secQuestions = [
    { id: 'q1', questions: "What city were you born in?" },
    { id: 'q2', questions: "What is your birth month? (e.g June, July...)" },
    { id: 'q3', questions: "What was the name of the first school you remember attending?" }
  ]

  // --  SQ = Security Questions --
  findAllSQ() {
    return this.secQuestions;
  }

  findOneSQ(questionId: string) {
    for (let i = 0; i < this.secQuestions.length; i++) {
      if (this.secQuestions[i].id === questionId) {
        return this.secQuestions[i].questions;
      }
    }
    throw new NotFoundException("Question id not found")
  }

  async saveMutliAnswer(userId: string, dto: MultiSecurityQuestionDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const entities: DeepPartial<SecurityQuestion>[] = [];

    for (const item of dto.answers) {
      this.findOneSQ(item.questionId);

      const hash = await bcrypt.hash(item.answer, this.saltRounds);

      const entity = this.secureQuestionRepo.create({
        answers: {
          questionId: item.questionId,
          answer: hash,
        },
        user,
      });

      entities.push(entity);
    }

    const saved = await this.secureQuestionRepo.save(entities);

    return {
      userId: user.id,
      answers: saved.map(s => ({
        questionId: s.answers.questionId,
        answer: s.answers.answer,
      })),
    };
  }
}