import { log } from 'node:console'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { GitHubOauthGuard } from './auth/github-oauth.guards'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { OptionalJwtAuthGuard } from './auth/optional-jwt-auth.guard'
import { RolesGuard } from './auth/roles.guard'
import { CurrentUser } from './decorator/current-user.decorator'
import { Roles } from './decorator/roles.decorator'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { PaginateUserDto } from './dto/paginate-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserService } from './user.service'

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
      const result = await this.authService.signup(dto)

      return {
        success: true,
        message: 'User registered successfully',
        data: result,
      }
    }
    catch (error) {
      console.error('Signup error:', error.message)

      if (error instanceof BadRequestException) {
        throw error
      }

      throw new BadRequestException('Registration failed. Please try again.')
    }
  }

  @Patch('/me')
  @UseGuards(JwtAuthGuard)
  async updateSelf(@CurrentUser() user, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(user.id, dto)
  }

  @Roles(['TEACHER', 'ADMIN', 'SUPER_ADMIN'])
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(id, dto)
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Admin role' })
  async createSuperTeacher(@Body() dto: CreateUserDto) {
    try {
      const result = await this.userService.createSuperTeacher(dto)
      return {
        success: true,
        message: 'Admin created successfully',
        data: result,
      }
    }
    catch (error) {
      console.error('Create Admin error:', error.message)
      throw new BadRequestException('Failed to create Admin. Please try again.')
    }
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() pagination: PaginateUserDto, @CurrentUser() user) {
    return this.userService.paginate(pagination, user)
  }

  @Post('refresh')
  getNewTokens(@Body('refresh_token') refreshToken: string) {
    return this.authService.refresh(refreshToken)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(@Body() dto: LoginDto) {
    try {
      // Validate input
      if (!dto.email || !dto.password) {
        throw new BadRequestException('Email and password are required')
      }

      const result = await this.authService.login(dto)

      return {
        success: true,
        message: 'Login successful',
        data: result,
      }
    }
    catch (error) {
      // Log the error for debugging
      console.error('Login error:', error)

      if (
        error instanceof UnauthorizedException
        || error instanceof BadRequestException
      ) {
        throw error
      }

      // Handle unexpected errors
      throw new UnauthorizedException(error)
    }
  }

  @Post('logout/:id')
  @ApiOperation({ summary: 'Log user out and revoke the token' })
  async logout(@Param('id') id: string) {
    this.authService.revokeToken(id)
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  findUserWithCurrent(@CurrentUser() user: any) {
    log('Current User:', user)
    return this.userService.findUserById(user.userId)
  }

  // @Get('google/callback')
  // @UseGuards(GoogleOauthGuard)
  // async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
  //   const googleUser = req.user as any
  //   const tokens = await this.authService.handleGoogleLogin(googleUser)

  //   res.cookie('access_token', tokens.access_token, {
  //     maxAge: 2592000000,
  //     sameSite: 'none',
  //     secure: true,
  //     domain: 'localhost',
  //     path: '/', // cookie will attach to whatever hostname the backend is served on
  //   })

  //   const frontendUrl: string = this.configService.getOrThrow('FRONTEND_HOST')
  //   return res
  //     .status(HttpStatus.OK)
  //     .redirect(`${frontendUrl}/student/dashboard?token=${tokens.access_token}`)
  // }

  // Redirect user to GitHub Login Page
  @Get('github')
  @UseGuards(GitHubOauthGuard)
  async authGitHub() {}

  // @Get('github/callback')
  // @UseGuards(GitHubOauthGuard)
  // async githubAuthCallBack(@Req() req: Request, @Res() res: Response) {
  //   const githubUser = req.user as any
  //   const tokens = await this.authService.handleGitHubLogin(githubUser)

  //   res.cookie('access_token', tokens.access_token, {
  //     maxAge: 2592000000,
  //     sameSite: 'none',
  //     secure: true,
  //     domain: 'localhost', // in prod change to frontend real domain
  //     path: '/', // cookie will attach to whatever hostname the backend is served on
  //   })

  //   const frontendUrl: string = this.configService.getOrThrow('FRONTEND_HOST')
  //   return res
  //     .status(HttpStatus.OK)
  //     .redirect(`${frontendUrl}/student/dashboard?token=${tokens.access_token}`)
  // }

  @Get('search')
  @ApiOperation({ summary: 'Search students by name' })
  async searchUser(@Query('q') q: string) {
    try {
      if (!q || q.trim() === '') {
        return {
          success: true,
          message: 'No search query provided',
          data: [],
        }
      }
      const users = await this.userService.searchUser(q)
      return {
        success: true,
        message: 'Search Completed',
        data: users,
      }
    }
    catch (error) {
      console.error('Search error:', error.message)
      throw new BadRequestException('Search failed. Please try again! ')
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  getUserById(@Param('id') id: string) {
    return this.userService.findUserById(id)
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('files'))
  @ApiOperation({ summary: 'Upload user profile pic' })
  uploadProfile(@CurrentUser() user: { id: string }, @UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadPFP(user.id, file)
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user profile pic' })
  deleteProfile(@CurrentUser() user: { id: string }) {
    return this.userService.deletePFP(user.id)
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Account recovery' })
  async forgotPassword(@Body() dto: ChangePasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Account recovery' })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(dto, user.id)
  }

  @Post('real-student')
  @ApiOperation({ summary: 'Verify real students' })
  async verifyStudent(@Body() dto: CreateUserDto) {
    return this.authService.verifyRealStudent(dto)
  }
}
