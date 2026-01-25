import { Test, TestingModule } from '@nestjs/testing';
import { RealStudentService } from './real-student.service';

describe('RealStudentService', () => {
  let service: RealStudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealStudentService],
    }).compile();

    service = module.get<RealStudentService>(RealStudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
