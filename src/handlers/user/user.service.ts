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
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role'] })
    if (!user)
      throw new NotFoundException('User not found')
    return instanceToPlain(user) // Ommit password field
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
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.email'])
      .where('user.firstname ILIKE :prefix', { prefix: `${q}%` })
      .orWhere('user.lastname ILIKE :prefix', { prefix: `${q}%` })
      .orderBy('user.firstname', 'ASC')
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
      qb.andWhere('u.firstname ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
        .orWhere('u.lastname ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
    }

    const [users, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('u.createdAt', 'DESC')
      .getManyAndCount()

    const transformed: any[] = users.map((u) => ({
      id: u.id,
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      bio: u.bio,
      year: u.year,
      skill: u.skill,
      avatar: u.avatarUrl,
      department: {
        id: u.department.id,
        name: u.department.name,
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
