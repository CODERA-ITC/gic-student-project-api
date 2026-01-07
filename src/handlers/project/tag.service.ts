import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationDto } from 'src/common/dto/pagination.dto'
import { Repository } from 'typeorm'
import { Tag } from './entities/tag.entity'

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepo: Repository<Tag>,
    ) {}

    async findAll() {
        return this.tagRepo.find()
    }

    async paginate(params: PaginationDto) {
        const page = params.page ?? 1
        const limit = params.limit ?? 8
        const skip = (page - 1) * limit

        const qb = this.tagRepo.createQueryBuilder('t')

        // Optional search (e.g., search by project name)
        if (params.search) {
            qb.andWhere('t.name ILIKE :search', { search: `%${params.search.trim().toLowerCase()}%` })
        }

        const [tags, total] = await qb
            .skip(skip)
            .take(limit)
            .orderBy('t.createdAt', 'DESC')
            .getManyAndCount()

        return {
            data: tags,
            page,
            limit,
            total,
            lastPage: Math.ceil(total / limit),
        }
    }
}
