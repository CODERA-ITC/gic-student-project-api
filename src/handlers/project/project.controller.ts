import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { CreateProjectDto } from './dto/create-project.dto'
import { CreateFeatureDto } from './dto/create-feature.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
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

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.createProjectAndNotify(dto)
  }

  // ==============================================================================
  // Project Feature Controller
  // ==============================================================================
  @Get('features')
  findAllFeatures() {
    return this.projectService.findAllFeatures()
  }

  @Post('features')
  createFeature(@Body() dto: CreateFeatureDto) {
    return this.projectService.createFeature(dto)
  }

  @Get('features/:id')
  findOneFeature(@Param('id') id: string) {
    return this.projectService.findOneFeature(id)
  }

  @Get(':projectId/features')
  findFeaturesByProject(@Param('projectId') projectId: string) {
    return this.projectService.findFeaturesByProject(projectId)
  }

  // ==============================================================================
  // Project Controller
  // ==============================================================================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto)
  }
}
