import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/handlers/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.projects, { eager: true })
  @JoinColumn({ name: 'owner_id' }) // custom FK column name
  owner: User;
}
