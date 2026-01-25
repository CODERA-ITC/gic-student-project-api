import { Test, TestingModule } from '@nestjs/testing';
import { RealStudentController } from './real-student.controller';
import { RealStudentService } from './real-student.service';

describe('RealStudentController', () => {
  let controller: RealStudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealStudentController],
      providers: [RealStudentService],
    }).compile();

    controller = module.get<RealStudentController>(RealStudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
