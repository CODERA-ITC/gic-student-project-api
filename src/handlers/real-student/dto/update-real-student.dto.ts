import { PartialType } from '@nestjs/swagger';
import { CreateRealStudentDto } from './create-real-student.dto';

export class UpdateRealStudentDto extends PartialType(CreateRealStudentDto) {}
