import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

export interface DepartmentResponse {
    id: string
    name: string
    description: string
    code: string
}

export interface DepartmentsResponse {
    message: string
    success: boolean
    data: DepartmentResponse[]
}

@Injectable()
export class DepartmentClient {
    private readonly userHost: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService,
    ) {
        this.userHost = String(configService.get('USER_SERVICE_HOST'))
    }

    async findOne(deptId: string): Promise<DepartmentResponse> {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/departments/${deptId}`),
        )
        return data
    }

    async findOneOrNull(deptId: string): Promise<DepartmentResponse | null> {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.userHost}/departments/${deptId}`),
            )
            return data
        }
        catch (e) {
            return null
        }
    }

    async findAll(): Promise<DepartmentsResponse> {
        const { data } = await firstValueFrom(
            this.http.get(
                `${this.userHost}/departments`,
            ),
        )
        return data
    }
}
