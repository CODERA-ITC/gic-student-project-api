import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
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

  @Post(':id/tag')
  createTag(@Param('id') projectId: string, @Body() dto: CreateTagDto) {
    return this.tagService.createTag(projectId, dto)
  }

  @Delete(':id/tag/:tagId')
  deleteTag(@Param('id') projectId: string, @Param('tagId') tagId: string) {
    return this.tagService.deleteTag(tagId)
  }
}
