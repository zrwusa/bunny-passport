import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationService } from '../../translation.service';

// Used to translate the fields in the returned information that need to be internationalized.
@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const lang = request.headers['accept-language'] || 'en';
    request.i18nLang = lang;

    return next.handle().pipe(
      map(async (data) => {
        if (data && data.message) {
          data.message = await this.translationService.translate(
            data.message,
            lang,
          );
        }
        return data;
      }),
    );
  }
}
