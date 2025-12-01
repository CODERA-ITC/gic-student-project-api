import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Department } from '../department/entitites/department.entity'
import { Category } from '../project/entities/category.entity'
import { SeederController } from './seeder.controller'
import { SeederService } from './seeder.service'

@Module({
  controllers: [SeederController],
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([Department, Category])],
})
export class SeederModule {}
