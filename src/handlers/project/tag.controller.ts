import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard'
import { RolesGuard } from '../user/auth/roles.guard'
import { Roles } from '../user/decorator/roles.decorator'
import { CreateTagDto } from './dto/create-tag.dto'
import { TagService } from './tag.service'

@Controller('tags')
export class TagController {
  constructor(
    private readonly tagService: TagService,
  ) {}

  @Get()
  async findAll(@Query() params: PaginationDto) {
    return this.tagService.paginate(params)
  }

  @Roles(['TEACHER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createTag(@Body() dto: CreateTagDto) {
    return this.tagService.createTag(dto)
  }

  @Roles(['TEACHER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateTagDto) {
    return this.tagService.update(id, dto)
  }

  @Roles(['TEACHER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteTag(@Param('id') id: string) {
    return this.tagService.deleteTag(id)
  }
}
