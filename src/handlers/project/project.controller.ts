import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../user/auth/optional-jwt-auth.guard'
import { RolesGuard } from '../user/auth/roles.guard'
import { CurrentUser } from '../user/decorator/current-user.decorator'
import { Roles } from '../user/decorator/roles.decorator'
import { AddProjectMemberDto } from './dto/add-member.dto'
import { CreateFeatureDto } from './dto/create-feature.dto'
import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectPaginateDto } from './dto/paginate-project.dto'
import { UpdateFeatureDto, UpdateFeatureStatusDto } from './dto/update-feature.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectService } from './project.service'

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload multiple images to a project' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 5))
  create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.projectService.create(createProjectDto, files)
  }

  @Post('submit/:id')
  submitProject(@Param('id') id: string) {
    return this.projectService.submitProjectForReview(id)
  }

  @Roles(['TEACHER'])
  @Patch('accept/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async acceptProject(@Param('id') projectId: string, @Req() req: any) {
    const teacherId = req.user?.id
    return this.projectService.acceptProject(projectId, teacherId)
  }

  @Get()
  findAll(@Query() pagination: ProjectPaginateDto) {
    return this.projectService.paginate(pagination)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUserProjects(@CurrentUser() user: any) {
    return this.projectService.getProjectsByUserId(user.id)
  }

  @Get('hightlights')
  async getHightlightedProjects() {
    return this.projectService.getHighlightedProjects()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.delete(id)
  }

  @Post(':id/members')
  addMembers(@Param('id') projectId: string, @Body() dto: AddProjectMemberDto) {
    return this.projectService.addMembers(projectId, dto.memberIds)
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

  //
  @Post(':id/view')
  @UseGuards(OptionalJwtAuthGuard)
  async trackView(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    await this.projectService.incrementViewCount(projectId)
    return { message: 'View tracked successfully' }
  }

  // ===========================================
  // Get the total view count for a project
  // ===========================================
  @Get(':id/view-count')
  async getViewCount(@Param('id') projectId: string) {
    const viewCount = await this.projectService.getProjectViewCount(projectId)
    return { projectId, viewCount }
  }

  // // =================================================
  // // Check if the current user has viewed a project
  // // =================================================
  // @Get(':id/has-viewed')
  // @UseGuards(OptionalJwtAuthGuard)
  // async hasViewed(
  //   @Param('id') projectId: string,
  //   @CurrentUser() user: any,
  // ) {
  //   const hasViewed = await this.projectService.hasUserViewedProject(projectId, user?.id)
  //   return { projectId, hasViewed }
  // }

  // ========================================================
  // PROJECT LIKE CONTROLLER
  // ========================================================

  // ================================
  // Toggle like/unlike on a project
  // ================================
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectService.toggleProjectLike(projectId, user.id)
  }

  // ==================================
  // Get total like count for a project
  // ==================================
  @Get(':id/like-count')
  async getLikeCount(@Param('id') projectId: string) {
    const likeCount = await this.projectService.getProjectLikeCount(projectId)
    return { projectId, likeCount }
  }

  // =========================================
  // Check if current user has liked a project
  // =========================================
  @Get(':id/has-liked')
  @UseGuards(OptionalJwtAuthGuard)
  async hasLiked(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
  ) {
    const hasLiked = await this.projectService.hasUserLikedProject(projectId, user?.id)
    return { projectId, hasLiked }
  }

  @Get('me/likes')
  @UseGuards(JwtAuthGuard)
  async getLikedProjects(
    @CurrentUser() user: any,
  ) {
    return this.projectService.getLikedProjectsByUserId(user.id)
  }
}
