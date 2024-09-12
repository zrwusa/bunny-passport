// src/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // TODO logger should be dependency injected?
  private logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    // TODO error messages should be managed by enums and localization?
    this.logger.log('JwtAuthGuard triggered');
    return super.canActivate(context);
  }
}
