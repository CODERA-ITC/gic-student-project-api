import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Roles } from '../decorator/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride(
      Roles,
      [
        context.getHandler(),
        context.getClass(),
      ],
    )

    const { user } = context.switchToHttp().getRequest()

    return requiredRoles.includes(user.role)
  };
}
