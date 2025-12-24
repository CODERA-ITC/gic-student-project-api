import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { instanceToPlain } from 'class-transformer'

import { Not, Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { Role } from '../role/entities/role.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>
  ) { }

  // =============
  // Create
  // =============
  async createUser(dto: CreateUserDto) {
    const {role: roleName, ...userData} = dto
    const user = this.userRepo.create(userData)

    const role = await this.roleRepo.findOneOrFail({where: {name: 'STUDENT'}})
    user.role = role;

    return this.userRepo.save(user)
  }

  // ==============================================================================
  // Read (Decision to use instanceToPlain: avoid exposing password on request)
  // ==============================================================================
  async findUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } })
  }

  async findUserByEmailWithSecrets(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        hashedRefreshToken: true
      },
      relations: ['role']
    })
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user)
      throw new NotFoundException('User not found')
    return instanceToPlain(user) // Ommit password field
  }

  // =============
  // Update
  // =============
  async updateUser(id: string, dto: UpdateUserDto) {
    const {role: roleName, ...userData} = dto
    const result = await this.userRepo.update(id, userData)
    if (result.affected === 0)
      throw new NotFoundException('User not found')
    return this.findUserById(id)
  }

  // ======================
  // Search query for user
  // =======================
  async searchUser(q: string) {
    if (!q || q.trim() === '')
      return []
    return this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.email'])
      .where('user.firstname ILIKE :prefix', { prefix: `${q}%` })
      .orWhere('user.lastname ILIKE :prefix', { prefix: `${q}%` })
      .orderBy('user.firstname', 'ASC')
      .limit(10)
      .getMany()
  }
}
