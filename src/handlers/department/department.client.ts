import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class DepartmentClient {
    private readonly deptHostService: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService
    ) {
        this.deptHostService = String(configService.get('DEPT_SERVICE_HOST'))
    }
    async getDepartment(deptIds: string) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.deptHostService}/${deptIds}`)
        )
        return data
    }

    async getDepartments(deptIds: string[]) {
        const { data } = await firstValueFrom(
            this.http.post(
                `${this.deptHostService}/departments/batch`,
                { deptIds }
            )
        )
        return data
    }
}
