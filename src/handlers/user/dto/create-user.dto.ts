import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { SocialLink } from '../entities/user.entity'

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: 'Please enter your firstName' })
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please input a valid email address' })
  @Transform(({ value }) => value?.trim())
  email: string

  @ApiProperty({ example: '@password123' })
  @MinLength(8)
  @Matches(/^(?=.*[\W_]).{8,}$/, { message: 'Password must be at least 8 characters and contain at least one special character' })
  password: string

  @ApiProperty({ example: 'GIC' })
  @MaxLength(5)
  @MinLength(3)
  @IsNotEmpty()
  departmentCode: string

  @ApiProperty({ example: 'Professor at GIC' })
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  bio?: string

  @ApiProperty({ example: '' })
  @IsString()
  studentId: string

  @ApiProperty({ example: 'អំ ជេដ្ឋាមានឫទ្ធ' })
  @IsNotEmpty()
  @IsString()
  nameKh: string

  @ApiProperty({ example: '3/28/2005' })
  @IsNotEmpty()
  @IsString()
  dob: string

  @ApiProperty({ example: '85939000' })
  @IsNotEmpty()
  @IsNumber()
  phoneNumber: number

  @ApiProperty({ example: '25' })
  @IsNotEmpty()
  @IsNumber()
  generation: number

  @ApiProperty({
    example:
      JSON.stringify([{ name: 'youtube', url: 'https://www.youtube.com/@MuseAsia' }]),
  })
  @Type(() => SocialLink)
  @IsArray()
  @IsOptional()
  socialLinks: SocialLink[]

  refreshToken?: string | null
}
