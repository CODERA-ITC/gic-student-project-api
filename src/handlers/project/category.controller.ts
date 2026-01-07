import {
    Body,
    Controller,
    Get,
    Param,
    Post,
} from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectService } from './project.service'

@Controller('categories')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ) {}

    @Get()
    findAll() {
        return this.categoryService.findAll()
    }
}
