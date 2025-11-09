import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '@password123' })
  @MinLength(8)
  @Matches(/^(?=.*[\W_]).{8,}$/, {message: 'Password must be at least 8 characters and contain at least one special character'})
  password: string;

  @ApiProperty({example: 'GIC'})
  @MinLength(5)
  @IsNotEmpty()
  department_code: string;
}
