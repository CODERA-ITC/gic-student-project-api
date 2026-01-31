import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { RealStudent } from '../real-student/entities/real-student.entity'
import { Role } from '../role/entities/role.entity'
import { SecurityQuestion } from '../security_questions/entities/security_question.entity'
import { SecurityQuestionsModule } from '../security_questions/security_questions.module'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { User } from './entities/user.entity'
import { GitHubStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Role,
    Department,
    RealStudent,
    SecurityQuestion,
  ]), PassportModule, SecurityQuestionsModule],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, JwtAuthGuard, GoogleStrategy, GitHubStrategy],
  exports: [UserService, AuthService],
})
export class UserModule {}
