import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { CategoryService } from './category.service'

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async findAll(@Query() params: PaginationDto) {
    return this.categoryService.paginate(params)
  }
}
