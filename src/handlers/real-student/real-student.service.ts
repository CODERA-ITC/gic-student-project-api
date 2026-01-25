import { Injectable } from '@nestjs/common';
import { CreateRealStudentDto } from './dto/create-real-student.dto';
import { UpdateRealStudentDto } from './dto/update-real-student.dto';

@Injectable()
export class RealStudentService {
  create(createRealStudentDto: CreateRealStudentDto) {
    return 'This action adds a new realStudent';
  }

  findAll() {
    return `This action returns all realStudent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} realStudent`;
  }

  update(id: number, updateRealStudentDto: UpdateRealStudentDto) {
    return `This action updates a #${id} realStudent`;
  }

  remove(id: number) {
    return `This action removes a #${id} realStudent`;
  }
}
