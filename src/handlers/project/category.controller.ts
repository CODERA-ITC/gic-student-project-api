import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard'
import { RolesGuard } from '../user/auth/roles.guard'
import { Roles } from '../user/decorator/roles.decorator'
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

  @Roles(['TEACHER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto)
  }

  @Roles(['TEACHER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.update(id, dto)
  }

  @Roles(['TEACHER'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id)
  }
}
