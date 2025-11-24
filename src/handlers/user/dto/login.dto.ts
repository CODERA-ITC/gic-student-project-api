import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please input a valid email address' })
  email: string;

  @ApiProperty({ example: '@password123' })
  @IsNotEmpty()
  password: string;
}
