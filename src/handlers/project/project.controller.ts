import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import { AddProjectMemberDto } from './dto/add-member.dto'
import { CreateFeatureDto } from './dto/create-feature.dto'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateFeatureDto, UpdateFeatureStatusDto } from './dto/update-feature.dto'
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
  submitProject(@Param('id') id: string) {
    return this.projectService.submitProjectForReview(id)
  }

  @Patch('accept/:id')
  async acceptProject(@Param('id') projectId: string, @Req() req: any) {
    const teacherId = req.user?.id
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

  @Post(':id/members')
  addMembers(@Param('id') projectId: string, @Body() dto: AddProjectMemberDto) {
    return this.projectService.addMembers(projectId, dto.authorId, dto.memberIds)
  }

  @Post(':id/features')
  createFeature(@Param('id') projectId: string, @Body() dto: CreateFeatureDto) {
    return this.projectService.createFeature(projectId, dto)
  }

  @Patch(':id/features/:featureId')
  updateFeature(@Param('projectId') projectId: string, @Param('featureId') featureId: string, @Body() dto: UpdateFeatureDto) {
    return this.projectService.updateFeature(featureId, dto)
  }

  @Patch(':id/features/:featureId/status')
  updateFeatureStatus(@Param('projectId') projectId: string, @Param('featureId') featureId: string, @Body() dto: UpdateFeatureStatusDto) {
    return this.projectService.updateFeatureStatus(featureId, dto.status)
  }

  @Delete(':id/features/:featureId')
  deleteFeature(@Param('id') projectId: string, @Param('featureId') featureId: string) {
    return this.projectService.deleteFeature(featureId)
  }
}
