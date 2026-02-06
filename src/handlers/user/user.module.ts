import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { GitHubStrategy } from './strategies/github.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { UserClient } from './user.client'
import { UserController } from './user.controller'

@Module({
  imports: [PassportModule, HttpModule],
  controllers: [UserController],
  providers: [
    JwtService,
    JwtAuthGuard,
    GoogleStrategy,
    GitHubStrategy,
    UserClient,
  ],
  exports: [UserClient],
})
export class UserModule {}
