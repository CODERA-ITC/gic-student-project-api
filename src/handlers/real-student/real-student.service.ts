import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { InjectRepository } from '@nestjs/typeorm';
import { RealStudent } from './entities/real-student.entity';
import { Repository } from 'typeorm';

const STUDENT_HEADER_MAP: Record<string, string> = {
  'ID': 'studentId',
  'Name': 'nameEn',
  'Name_KH': 'nameKh',
  'Gender': 'gender',
  'Date of Birth': 'dob',
  'Phone Number': 'phoneNumber',
  'CLASS': 'class',
  'Other': 'group',
};

@Injectable()
export class RealStudentService {
  constructor(
    @InjectRepository(RealStudent)
    private realStudent: Repository<RealStudent>
  ) { }
  async importCSV(file: Express.Multer.File) {
    try {
      const records = parse(file.buffer, {
        delimiter: ',',
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      const mappedRecords = records.map(record => this.mapStudentRecord(record));
      await this.realStudent.save(mappedRecords);

      return {
        success: true,
        count: mappedRecords.length,
        data: mappedRecords,
      };

    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

  private mapStudentRecord(record: any) {
    const mapped: any = {};

    for (const [csvHeader, dtoProperty] of Object.entries(STUDENT_HEADER_MAP)) {
      if (record[csvHeader] !== undefined) {
        mapped[dtoProperty] = record[csvHeader];
      }
    }

    return mapped;
  }
}