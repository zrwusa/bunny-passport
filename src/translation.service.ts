import { Injectable } from '@nestjs/common';
import {
  ServiceBusinessLogicCode,
  TranslateBusinessLogicFrom,
  TranslateRes,
} from './types';

import {
  CONTROLLER_BUSINESS_LOGICS,
  SERVICE_BUSINESS_LOGICS,
} from './common/constants';

@Injectable()
export class TranslationService {
  translateBusinessLogicCode(
    code: ServiceBusinessLogicCode,
    lang: string = 'en',
    translateBusinessLogicFrom: TranslateBusinessLogicFrom = 'service',
  ): TranslateRes {
    let BUSINESS_LOGICS;
    switch (translateBusinessLogicFrom) {
      case 'service':
        BUSINESS_LOGICS = SERVICE_BUSINESS_LOGICS;
        break;
      case 'controller':
        BUSINESS_LOGICS = CONTROLLER_BUSINESS_LOGICS;
        break;
      default:
        break;
    }
    let businessLogic = null;

    for (const functionKey in BUSINESS_LOGICS) {
      if (BUSINESS_LOGICS[functionKey].hasOwnProperty(code)) {
        businessLogic = BUSINESS_LOGICS[functionKey][code];
        break;
      }
    }
    if (businessLogic) {
      return {
        success: true,
        translated: businessLogic[lang] || businessLogic['en'],
      };
    }
    return { success: false, translated: code };
  }

  async translate(
    key: ServiceBusinessLogicCode,
    lang: string,
  ): Promise<TranslateRes> {
    const res = this.translateBusinessLogicCode(
      key as ServiceBusinessLogicCode,
      lang,
      'controller',
    );
    const { success } = res;
    if (success) return res;
    else {
      const res = this.translateBusinessLogicCode(
        key as ServiceBusinessLogicCode,
        lang,
        'service',
      );
      const { success } = res;
      if (success) return res;
      else return { success: false, translated: key };
    }
  }
}
