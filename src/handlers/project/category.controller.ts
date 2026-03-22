import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async findAll(@Query() params: PaginationDto) {
    return this.categoryService.paginate(params)
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.update(id, dto)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id)
  }
}
