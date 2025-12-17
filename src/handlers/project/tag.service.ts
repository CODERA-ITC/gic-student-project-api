import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tag } from './entities/tag.entity'

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepo: Repository<Tag>,
    ) { }

    async findAll() {
        return this.tagRepo.find()
    }
}
