import {
  Controller,
  Get,
} from '@nestjs/common'
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
  get() {
    return 'Hello World'
  }
}
