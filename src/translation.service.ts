import { Injectable } from '@nestjs/common';
import { en } from './i18n/en';
import { zh } from './i18n/zh';
import { get } from 'lodash';

@Injectable()
export class TranslationService {
  private readonly translations = {
    en,
    zh,
  };

  async translate(
    key: string,
    lang: string,
    parentPath: 'errors' | 'notifications' = 'errors',
  ): Promise<string> {
    return get(this.translations[lang], `${parentPath}.${key}`) || key;
  }

  // Helper function to resolve the path
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }
}
