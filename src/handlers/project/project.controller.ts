import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
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

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto)
  }

  @Post('submit/:id')
  submitProject(@Param('id') id: string){
    return this.projectService.submitProjectForReview(id);
  }

  @Patch('accept/:id')
  async acceptProject(@Param('id') projectId: string, @Req() req: any){
    const teacherId = req.user?.id;
    return this.projectService.acceptProject(projectId, teacherId)
  }

  @Get()
  findAll() {
    return this.projectService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto)
  }
}
