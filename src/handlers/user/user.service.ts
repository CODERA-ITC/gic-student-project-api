import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  // =============
  // Create
  // =============
  async createUser(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  // ==============================================================================
  // Read (Decision to use instanceToPlain: avoid exposing password on request)
  // ==============================================================================
  async listAllUser() {
    const users = await this.userRepo.find();
    return users.map(user => instanceToPlain(user)) // Ommit password column
  }

  async findUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findOne({where: {id}});
    if (!user) throw new NotFoundException('User not found');
    return instanceToPlain(user);
  }

  // =============
  // Update
  // =============
  async updateUser(id: string, dto: UpdateUserDto){
    const result = await this.userRepo.update(id, dto);
    if(result.affected === 0) throw new NotFoundException('User not found');
    return this.findUserById(id);
  }
}
