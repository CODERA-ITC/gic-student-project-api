import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common'
import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectService } from './project.service'

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) { }

  // @Post()
  // create(@Body() createProjectDto: CreateProjectDto) {
  //   return this.projectService.create(createProjectDto)
  // }

  @Get()
  findAll() {
    return this.projectService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto)
  }
}
