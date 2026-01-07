import { Controller, Get, Query } from '@nestjs/common'
import { TagService } from './tag.service'
import { PaginationDto } from 'src/common/dto/pagination.dto'

@Controller('tags')
export class TagController {
    constructor(
        private readonly tagService: TagService,
    ) {}

    @Get()
    async findAll(@Query() params: PaginationDto) {
        return this.tagService.paginate(params)
    }
}
