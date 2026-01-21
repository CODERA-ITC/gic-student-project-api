import * as crypto from 'node:crypto'
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { UserService } from '../user/user.service'
import { LoginDto } from './dto/login.dto'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: CreateUserDto) {
    const check_email = await this.userService.findUserByEmail(dto.email)
    if (check_email)
      throw new BadRequestException('Email already registered')

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.userService.createUser({
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
  async handleGoogleLogin(googleUser: any) {
    let user = await this.userService.findUserByEmailWithSecrets(googleUser.email)

    // Create random hash to bypass DTO
    const randomPassword = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await bcrypt.hash(randomPassword, 10)

    if (!user) {
      user = await this.userService.createUser({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: hashedPassword,
        departmentCode: 'GIC', // Need to handle this better
        role: { name: 'STUDENT' },
      })
    }

    return this.generateTokens(user)
  }

  // Handle GitHub OAuth login/sign up
  async handleGitHubLogin(githubUser: any) {
    let user = await this.userService.findUserByEmailWithSecrets(githubUser.email)

    const randomPassword = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await bcrypt.hash(randomPassword, 10)

    if (!user) {
      user = await this.userService.createUser({
        email: githubUser.email,
        firstName: githubUser.firstName,
        lastName: githubUser.lastName,
        password: hashedPassword,
        departmentCode: 'GIC', // Need to handle this better
        role: { name: 'STUDENT' },
      })
    }

    return this.generateTokens(user)
  }

  private async saveRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10) // hashed token

    await this.userRepo.update(id, { hashedRefreshToken }) // store it in the hashedRefreshToken column
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
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      })

      const user = await this.userService.findUserByEmailWithSecrets(payload.email)
      if (!user)
        throw new UnauthorizedException('User not found')

      if (!user.hashedRefreshToken) {
        throw new UnauthorizedException('Empty Refresh Token')
      }
      const hashedRefreshToken = user.hashedRefreshToken

      // Check if refresh token has been revoked
      const tokenMatches = await bcrypt.compare(
        refreshToken,
        hashedRefreshToken,
      )

      if (!tokenMatches)
        throw new UnauthorizedException('Invalid refresh token')

      // Generate new refresh token
      const { access_token, refresh_token: newRefreshToken } = await this.generateTokens(user)

      // Store the new refresh token
      await this.saveRefreshToken(user.id, newRefreshToken)

      return { access_token, refreshToken: newRefreshToken }
    }
    catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  async revokeToken(id: string) {
    await this.userService.updateUser(id, { hashedRefreshToken: null })
  }

  // Helper method to check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email)
    return !!user
  }

  // Method to validate user credentials without logging in
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email)
    if (!user) {
      return null
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return null
    }

    return user
  }
}
