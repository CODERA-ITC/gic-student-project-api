import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RealStudentService } from './real-student.service';
import { CreateRealStudentDto } from './dto/create-real-student.dto';
import { UpdateRealStudentDto } from './dto/update-real-student.dto';

@Controller('real-student')
export class RealStudentController {
  constructor(private readonly realStudentService: RealStudentService) {}

  @Post()
  create(@Body() createRealStudentDto: CreateRealStudentDto) {
    return this.realStudentService.create(createRealStudentDto);
  }

  @Get()
  findAll() {
    return this.realStudentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.realStudentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRealStudentDto: UpdateRealStudentDto) {
    return this.realStudentService.update(+id, updateRealStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.realStudentService.remove(+id);
  }
}
