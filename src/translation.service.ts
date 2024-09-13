import { Injectable } from '@nestjs/common';
import { BusinessLogicCode } from './types';
import { translateBusinessLogicCode } from './common';

@Injectable()
export class TranslationService {
  async translate(key: BusinessLogicCode, lang: string): Promise<string> {
    return translateBusinessLogicCode(key as BusinessLogicCode, lang);
  }
}
