import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class DepartmentClient {
    private readonly userHost: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService,
    ) {
        this.userHost = String(configService.get('USER_SERVICE_HOST'))
    }

    async getDepartment(deptId: string) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/departments/${deptId}`),
        )
        return data
    }

    async getDepartments() {
        const { data } = await firstValueFrom(
            this.http.get(
                `${this.userHost}/departments`,
            ),
        )
        return data
    }
}
