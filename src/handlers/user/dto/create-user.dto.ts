import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: "Please enter your firstname" })
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstname: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastname: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please input a valid email address' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({ example: '@password123' })
  @MinLength(8)
  @Matches(/^(?=.*[\W_]).{8,}$/, { message: 'Password must be at least 8 characters and contain at least one special character' })
  password: string;

  @ApiProperty({ example: 'GIC' })
  @MaxLength(5)
  @MinLength(3)
  @IsNotEmpty()
  department_code: string;

  @ApiProperty({ example: 'Professor at GIC' })
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @ApiProperty({example: 'Refresh token for easy revoking'})
  @IsOptional()
  @IsString()
  hashedRefreshToken?: string | null;

  role: string;
  
  //pfp_thumbnail_url
  //pfp_hd_url
}
