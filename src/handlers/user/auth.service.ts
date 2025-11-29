import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) { }

  async signup(dto: CreateUserDto) {
    const check_email = await this.userService.findUserByEmail(dto.email);
    if (check_email) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.createUser({
      ...dto,
      password: hashedPassword,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    // First, check if user exists
    const user = await this.userService.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    // Then validate password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.generateTokens(user);
  }

  // Handle Google OAuth login/sign up
  async handleGoogleLogin(googleUser: any){
    let user = await this.userService.findUserByEmail(googleUser.email);
    
    // Create random hash to bypass DTO
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    if (!user) {
      user = await this.userService.createUser({
        email: googleUser.email,
        firstname: googleUser.firstname,
        lastname: googleUser.lastname,
        password: hashedPassword,
        department_code: 'GIC', //Need to handle this better
      })
    }

    return this.generateTokens(user);
  }

  private async saveRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10) //hashed token

    await this.userRepo.update(id, { hashedRefreshToken }) //store it in the hashedRefreshToken column
  }

  private async generateTokens(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES'),
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
    });

    await this.saveRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findUserByEmail(payload.email);
      if (!user) throw new UnauthorizedException('User not found');

      const hashedRefreshToken = user.hashedRefreshToken;
      // Check if refresh token has been revoked
      const tokenMatches = await bcrypt.compare(
        refreshToken,
        hashedRefreshToken
      );

      if (!tokenMatches) throw new UnauthorizedException('Invalid refresh token');

      // Generate new refresh token 
      const { access_token, refresh_token: newRefreshToken } = await this.generateTokens(user);

      // Store the new refresh token
      await this.saveRefreshToken(user.id, newRefreshToken);

      return { access_token, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async revokeToken(id: string) {
    await this.userService.updateUser(id, { hashedRefreshToken: null })
  }

  // Helper method to check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);
    return !!user;
  }

  // Method to validate user credentials without logging in
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }

    return user;
  }
}
