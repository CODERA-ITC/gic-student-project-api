import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

import { AuthService } from './auth.service';

import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { log } from 'node:console';
@ApiTags('auth')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  async signup(@Body() dto: CreateUserDto) {
    try {
      const result = await this.authService.signup(dto);

      return {
        success: true,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      console.error('Signup error:', error.message);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(@Body() dto: LoginDto) {
    try {
      // Validate input
      if (!dto.email || !dto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authService.login(dto);

      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      // Log the error for debugging
      console.error('Login error:', error.message);

      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  @Post('/logout/:id')
  @ApiOperation({summary: 'Log user out and revoke the token'})
  async logout(@Param('id') id:string){
    this.authService.revokeToken(id)
  }

  @Get(':id')
  @ApiOperation({summary: 'Get user by id'})
  getUserById(@Param('id') id: string){
    return this.userService.findUserById(id);
  }

  @Get('/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  findUserWithCurrent(@CurrentUser() user: any) {
    log('Current User:', user);
    return this.userService.findUserById(user.userId);
  }

  // @Get('/check-exists')
  // @ApiOperation({ summary: 'Check if user exists by email' })
  // async checkUserExists(@Query('email') email: string) {
  //   if (!email) {
  //     throw new BadRequestException('Email parameter is required');
  //   }

  //   const exists = await this.authService.checkUserExists(email);
  //   return {
  //     success: true,
  //     data: {
  //       email,
  //       exists,
  //       message: exists ? 'User exists' : 'User does not exist',
  //     },
  //   };
  // }
}
