import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { RealStudent } from '../real-student/entities/real-student.entity'
import { SecurityQuestionsService } from '../security_questions/security_questions.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { UserService } from '../user/user.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LoginDto } from './dto/login.dto'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {
  private readonly saltRoundsAuth: number
  constructor(
    configService: ConfigService,
    @InjectRepository(RealStudent)
    private readonly realStudentRepo: Repository<RealStudent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly securityQuestionsService: SecurityQuestionsService,
  ) {
    this.saltRoundsAuth = Number(configService.get('SALT_ROUNDS_AUTH'))
  }

  async signup(dto: CreateUserDto) {
    const realStudent = await this.verifyRealStudent(dto)
    if (!realStudent.verified) {
      throw new BadRequestException('Student not found')
    }

    const check_email = await this.userService.findUserByEmail(dto.email)
    if (check_email)
      throw new BadRequestException('Email already registered')

    const hashedPassword = await bcrypt.hash(dto.password, this.saltRoundsAuth)
    const user = await this.userService.createStudent({
      ...dto,
      password: hashedPassword,
    })

    return this.generateTokens(user)
  }

  async login(dto: LoginDto) {
    // First, check if user exists
    const user = await this.userService.findUserByEmailWithSecrets(dto.email)
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist')
    }

    // Then validate password
    const isMatch = await bcrypt.compare(dto.password, user.password)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password')
    }

    return this.generateTokens(user)
  }

  // Handle Google OAuth login/sign up
  // async handleGoogleLogin(googleUser: any) {
  //   let user = await this.userService.findUserByEmailWithSecrets(googleUser.email)

  //   // Create random hash to bypass DTO
  //   const randomPassword = crypto.randomBytes(32).toString('hex')
  //   const hashedPassword = await bcrypt.hash(randomPassword, 10)

  //   if (!user) {
  //     user = await this.userService.createUser({
  //       email: googleUser.email,
  //       firstName: googleUser.firstName,
  //       lastName: googleUser.lastName,
  //       password: hashedPassword,
  //       departmentCode: 'GIC', // Need to handle this better
  //       role: { name: 'STUDENT' },
  //     })
  //   }

  //   return this.generateTokens(user)
  // }

  // Handle GitHub OAuth login/sign up
  // async handleGitHubLogin(githubUser: any) {
  //   let user = await this.userService.findUserByEmailWithSecrets(githubUser.email)

  //   const randomPassword = crypto.randomBytes(32).toString('hex')
  //   const hashedPassword = await bcrypt.hash(randomPassword, 10)

  //   if (!user) {
  //     user = await this.userService.createUser({
  //       email: githubUser.email,
  //       firstName: githubUser.firstName,
  //       lastName: githubUser.lastName,
  //       password: hashedPassword,
  //       departmentCode: 'GIC', // Need to handle this better
  //       role: { name: 'STUDENT' },
  //     })
  //   }

  //   return this.generateTokens(user)
  // }

  private async saveRefreshToken(id: string, refreshToken: string) {
    await this.userRepo.save({ id, refreshToken }) // store it in the hashedRefreshToken column
  }

  private async generateTokens(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    }

    const access_token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES'),
    })

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
    })

    await this.saveRefreshToken(user.id, refresh_token)

    return {
      access_token,
      refresh_token,
    }
  }

  async refresh(refreshToken: string) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          refreshToken,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          refreshToken: true,
        },
        relations: {
          role: true,
        },
      })

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      if (!user.refreshToken) {
        throw new UnauthorizedException('Empty Refresh Token')
      }

      // Generate new refresh token
      const { access_token, refresh_token: newRefreshToken } = await this.generateTokens(user)

      // Store the new refresh token
      await this.saveRefreshToken(user.id, newRefreshToken)

      return { access_token, refresh_token: newRefreshToken }
    }
    catch (error) {
      throw new UnauthorizedException(error)
    }
  }

  async revokeToken(id: string) {
    await this.userService.updateUser(id, { refreshToken: null })
  }

  // Helper method to check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email)
    return !!user
  }

  async forgotPassword(dto: ChangePasswordDto) {
    const user = await this.userService.findUserByEmail(dto.email!)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.resetPasswordWithVerification(dto, user.id)
  }

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.resetPasswordWithVerification(dto, userId)
  }

  private async resetPasswordWithVerification(
    dto: ChangePasswordDto,
    userId: string,
  ) {
    const result = await this.securityQuestionsService.verifyMultiAnswer(
      { answers: dto.answers },
      userId,
    )

    if (!result.verified) {
      throw new UnauthorizedException(result.message)
    }

    const user = await this.userRepo.findOne({ where: { id: userId } })
    const hashedPassword = await bcrypt.hash(dto.newPassword, this.saltRoundsAuth)

    user!.password = hashedPassword
    await this.userRepo.save(user!)
    await this.revokeToken(userId)

    return {
      message: 'Password reset successfully',
    }
  }

  async verifyRealStudent(dto: CreateUserDto) {
    if (!dto.studentId || !dto.dob || !dto.nameKh || !dto.phoneNumber) {
      throw new BadRequestException('Field cannot be empty')
    }

    const real = await this.realStudentRepo.findOne({
      where: {
        studentId: dto.studentId,
        dob: dto.dob,
        nameKh: dto.nameKh,
        phoneNumber: dto.phoneNumber,
      },
    })

    if (!real) {
      return {
        verified: false,
      }
    }

    return {
      verified: true,
      message: 'Student verified successfully',
    }
  }
}
