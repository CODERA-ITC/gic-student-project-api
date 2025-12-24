import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { CurrentUser } from '../user/auth/current-user.decorator'
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard'
import { AddProjectMemberDto } from './dto/add-member.dto'
import { CreateFeatureDto } from './dto/create-feature.dto'
import { CreateProjectDto } from './dto/create-project.dto'
import { CreateTagDto } from './dto/create-tag.dto'
import { ProjectPaginateDto } from './dto/paginate-project.dto'
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
  findAll(@Query() pagination: ProjectPaginateDto) {
    return this.projectService.paginate(pagination)
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
    return this.projectService.updateFeatureStatus(featureId, dto)
  }

  @Delete(':id/features/:featureId')
  deleteFeature(@Param('id') projectId: string, @Param('featureId') featureId: string) {
    return this.projectService.deleteFeature(featureId)
  }

  @Post(':id/tag')
  createTag(@Param('id') projectId: string, @Body() dto: CreateTagDto) {
    return this.projectService.createTag(projectId, dto)
  }

  @Delete(':id/tag/:tagId')
  deleteTag(@Param('id') projectId: string, @Param('tagId') tagId: number) {
    return this.projectService.deleteTag(tagId)
  }

  //
  @Post(':id/view')
  @UseGuards(JwtAuthGuard)
  async trackView(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer', '');
    await this.projectService.trackProjectView(projectId, user.id)
    return { message: 'View tracked successfully' }
  }

  //===========================================
  // Get the total view count for a project
  //===========================================
  @Get(':id/view-count')
  async getViewCount(@Param('id') projectId: string) {
    const viewCount = await this.projectService.getProjectViewCount(projectId)
    return { projectId, viewCount }
  }

  //=================================================
  // Check if the current user has viewed a project
  //=================================================
  @Get(':id/has-viewed')
  @UseGuards(JwtAuthGuard)
  async hasViewed(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    const hasViewed = await this.projectService.hasUserViewedProject(projectId, user.id)
    return { projectId, hasViewed }
  }
}
