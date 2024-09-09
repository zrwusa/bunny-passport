// src/guards/jwt.ts
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.log('JwtAuthGuard triggered');
    return super.canActivate(context);
  }
}
