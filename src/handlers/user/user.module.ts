import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { Role } from '../role/entities/role.entity'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { User } from './entities/user.entity'
import { GitHubStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Department]), PassportModule],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, JwtAuthGuard, GoogleStrategy, GitHubStrategy],
  exports: [UserService, AuthService],
})
export class UserModule { }
