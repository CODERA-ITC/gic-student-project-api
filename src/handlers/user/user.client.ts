import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { PaginatedResponse } from 'src/common/interface/paginated-response.interface'
import { PaginateUserDto } from './dto/paginate-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

export interface UserReponse {
    id: string
    firstName: string
    lastName: string
    skills: string[]
    avatarUrl: string
    role: string
    email: string
}

export type UsersResponse = PaginatedResponse<UserReponse>

@Injectable()
export class UserClient {
    private readonly userHost: string
    constructor(
        private readonly configService: ConfigService,
        private readonly http: HttpService,
    ) {
        this.userHost = String(configService.get('USER_SERVICE_HOST'))
    }

    async getUser(userId: string): Promise<UserReponse> {
        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/users/${userId}`),
        )
        return data
    }

    async getUsers(
        params?: PaginateUserDto,
        user?: { access_token: string },
    ): Promise<UsersResponse> {
        const headers = user?.access_token
            ? this.getHeaders(user)
            : undefined

        const { data } = await firstValueFrom(
            this.http.get(`${this.userHost}/users`, {
                params,
                headers,
            }),
        )

        return data
    }

    async patchUser(
        userId: string,
        dto: UpdateUserDto,
        user?: { access_token: string },
    ): Promise<UserReponse> {
        const headers = user?.access_token
            ? this.getHeaders(user)
            : undefined

        const { data } = await firstValueFrom(
            this.http.patch(
                `${this.userHost}/users/${userId}`,
                dto,
                { headers },
            ),
        )

        return data
    }

    private getHeaders(user: any) {
        return {
            Authorization: `Bearer ${user.access_token}`,
        }
    }
}
