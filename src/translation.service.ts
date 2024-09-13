import { Injectable } from '@nestjs/common';
import { BusinessLogicNotificationCode } from './types';
import { getNotificationByLand } from './common';

@Injectable()
export class TranslationService {
  async translate(
    key: BusinessLogicNotificationCode,
    lang: string,
  ): Promise<string> {
    return getNotificationByLand(key as BusinessLogicNotificationCode, lang);
  }

  // Helper function to resolve the path
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }
}
