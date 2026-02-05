import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ApiTags } from '@nestjs/swagger'
import { OptionalJwtAuthGuard } from './auth/optional-jwt-auth.guard'
import { CurrentUser } from './decorator/current-user.decorator'
import { PaginateUserDto } from './dto/paginate-user.dto'
import { UserClient } from './user.client'

@ApiTags('auth')
@Controller('users')
export class UserController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userClient: UserClient,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() pagination: PaginateUserDto, @CurrentUser() user) {
    return this.userClient.findAll(pagination, user)
  }
}
