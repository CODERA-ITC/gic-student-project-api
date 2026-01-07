import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { instanceToPlain } from 'class-transformer'

import { Not, Repository } from 'typeorm'
import { Department } from '../department/entitites/department.entity'
import { Role } from '../role/entities/role.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { PaginationDto } from 'src/common/dto/pagination.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {}

  // =============
  // Create
  // =============
  async createUser(dto: CreateUserDto) {
    const { role: roleName, ...userData } = dto
    const user = this.userRepo.create(userData)

    const department = await this.departmentRepo.findOneOrFail({ where: { code: dto.departmentCode } })
    const role = await this.roleRepo.findOneOrFail({ where: { name: 'STUDENT' } })
    user.role = role
    user.department = department

    return this.userRepo.save(user)
  }

  // ==============================================================================
  // Read (Decision to use instanceToPlain: avoid exposing password on request)
  // ==============================================================================
  async findUserByEmail(email: string) {
    return this.userRepo.findOne(
      {
        where: {
          email,
        },
        relations: ['role'],
      },
    )
  }

  async findUserByEmailWithSecrets(email: string) {
    return this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        hashedRefreshToken: true,
      },
      relations: ['role'],
    })
  }

  async findUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role', 'department'] })
    if (!user)
      throw new NotFoundException('User not found')

    const transformed = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      year: user.year,
      skill: user.skill,
      avatar: user.avatarUrl,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      department: {
        id: user.department.id,
        name: user.department.name,
        code: user.department.code,
      },
    }

    return transformed
  }

  // =============
  // Update
  // =============
  async updateUser(id: string, dto: UpdateUserDto) {
    const { role: roleName, ...userData } = dto
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
      .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .where('user.firstName ILIKE :prefix', { prefix: `${q}%` })
      .orWhere('user.lastName ILIKE :prefix', { prefix: `${q}%` })
      .orderBy('user.firstName', 'ASC')
      .limit(10)
      .getMany()
  }

  async paginate(params: PaginationDto) {
    const page = params.page ?? 1
    const limit = params.limit ?? 10
    const skip = (page - 1) * limit

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.department', 'department')

    // Optional search (e.g., search by project name)
    if (params.search) {
      qb.andWhere('u.firstName ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
        .orWhere('u.lastName ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [users, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('u.createdAt', 'DESC')
      .getManyAndCount()

    const transformed: any[] = users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      bio: u.bio,
      year: u.year,
      skill: u.skill,
      avatar: u.avatarUrl,
      department: {
        id: u.department.id,
        name: u.department.name,
        code: u.department.code,
      },
    }))

    return {
      data: transformed,
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    }
  }
}
