import { BaseEntity } from 'src/database/base.entity';
import {
  Entity,
  Column,
} from 'typeorm';

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
