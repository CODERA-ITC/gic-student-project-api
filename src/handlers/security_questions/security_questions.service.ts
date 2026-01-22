import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async verifyMultiAnswer(dto: MultiSecurityQuestionDto, userId?: string) {
    const user = await this.getUserWithSecurityQuestions(dto, userId);

    this.validateUserHasSecurityQuestions(user);

    const allAnswersCorrect = await this.verifyAllAnswers(dto.answers, user.secureQuestions);

    if (!allAnswersCorrect) {
      return {
        verified: false,
        message: 'Incorrect Answers'
      }
    }

    return {
      verified: true,
      message: 'Security answers verified successfully'
    }
  }

  //HELPER FUNCTIONS

  //Change password or recovering password
  private async getUserWithSecurityQuestions(dto: MultiSecurityQuestionDto, userId?: string) {
    const whereClause = userId ? { id: userId } : { email: this.validateAndGetEmail(dto) }
    const user = await this.userRepo.findOne({ where: whereClause, relations: ['secureQuestions'] })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user;
  }

  //Validate email if user is revcovering 
  private validateAndGetEmail(dto: MultiSecurityQuestionDto) {
    if (!dto.email) {
      throw new BadRequestException(
        'Email is required for unauthenticated verification',
      );
    }
    return dto.email;
  }

  //Check if user has security questions
  private validateUserHasSecurityQuestions(user: User) {
    if (!user.secureQuestions?.length) {
      throw new NotFoundException('No security question found for user');
    }
  }

  private async verifyAllAnswers(
    providedAnswers: Array<{ questionId: string; answer: string }>,
    storedQuestions: SecurityQuestion[],
  ) {
    for (const provided of providedAnswers) {
      const stored = this.findStoredQuestion(provided.questionId, storedQuestions);
      const isCorrect = await this.verifyAnswer(provided.answer, stored.answers.answer);

      if (!isCorrect) {
        return false;
      }
    }

    return true;
  }

  private findStoredQuestion(questionId: string, storedQuestions: SecurityQuestion[]) {
    const question = storedQuestions.find(q => q.answers.questionId === questionId);

    if (!question) {
      throw new NotFoundException(
        `Security question ${questionId} not found for this user`,
      );
    }

    return question;
  }

  private async verifyAnswer(providedAnswer: string, hashedAnswer: string) {
    return bcrypt.compare(providedAnswer, hashedAnswer);
  }
}