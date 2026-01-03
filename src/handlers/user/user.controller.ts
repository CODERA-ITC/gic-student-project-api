import { log } from 'node:console';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './auth/current-user.decorator';
import { GitHubOauthGuard } from './auth/github-oauth.guards';
import { GoogleOauthGuard } from './auth/google-oauth.guards';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('auth')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.userService.paginate(pagination)
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
      console.error('Login error:', error);

      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new UnauthorizedException(error);
    }
  }

  @Post('logout/:id')
  @ApiOperation({ summary: 'Log user out and revoke the token' })
  async logout(@Param('id') id: string) {
    this.authService.revokeToken(id);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  findUserWithCurrent(@CurrentUser() user: any) {
    log('Current User:', user);
    return this.userService.findUserById(user.userId);
  }

  // Redirect user to Google Login Page
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async authGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;
    const tokens = await this.authService.handleGoogleLogin(googleUser);

    res.cookie('access_token', tokens.access_token, {
      maxAge: 2592000000,
      sameSite: 'none',
      secure: true,
      domain: 'localhost',
      path: '/', // cookie will attach to whatever hostname the backend is served on
    });

    const frontendUrl: string = this.configService.getOrThrow('FRONTEND_HOST');
    return res
      .status(HttpStatus.OK)
      .redirect(`${frontendUrl}/student/dashboard?token=${tokens.access_token}`);
  }

  // Redirect user to GitHub Login Page
  @Get('github')
  @UseGuards(GitHubOauthGuard)
  async authGitHub() {}

  @Get('github/callback')
  @UseGuards(GitHubOauthGuard)
  async githubAuthCallBack(@Req() req: Request, @Res() res: Response) {
    const githubUser = req.user as any;
    const tokens = await this.authService.handleGitHubLogin(githubUser);

    res.cookie('access_token', tokens.access_token, {
      maxAge: 2592000000,
      sameSite: 'none',
      secure: true,
      domain: 'localhost', // in prod change to frontend real domain
      path: '/', // cookie will attach to whatever hostname the backend is served on
    });

    const frontendUrl: string = this.configService.getOrThrow('FRONTEND_HOST');
    return res
      .status(HttpStatus.OK)
      .redirect(`${frontendUrl}/student/dashboard?token=${tokens.access_token}`);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name' })
  async searchUser(@Query('q') q: string) {
    try {
      if (!q || q.trim() === '') {
        return {
          success: true,
          message: 'No search query provided',
          data: [],
        };
      }
      const users = await this.userService.searchUser(q);
      return {
        success: true,
        message: 'Search Completed',
        data: users,
      };
    } catch (error) {
      console.error('Search error:', error.message);
      throw new BadRequestException('Search failed. Please try again! ');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  getUserById(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }
}
