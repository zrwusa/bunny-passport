import { ServiceResponse } from '../interfaces';
import { BUSINESS_LOGICS } from './constants';
import { BusinessLogicCode } from '../types';

export function translateBusinessLogicCode(
  code: BusinessLogicCode,
  lang: string = 'en',
): string {
  let error = {};
  for (const functionKey in BUSINESS_LOGICS) {
    if (BUSINESS_LOGICS[functionKey].hasOwnProperty(code)) {
      error = BUSINESS_LOGICS[functionKey][code];
      break;
    }
  }
  return error ? error[lang] || error['en'] : code;
}

export function serviceProtocolResFactory<
  T extends keyof typeof BUSINESS_LOGICS,
>(logicType: T) {
  const createSuccessRes = function <
    B extends keyof (typeof BUSINESS_LOGICS)[T],
    D,
  >(notificationCode: B, data?: D): ServiceResponse<D> {
    return {
      success: true,
      message: notificationCode,
      data,
    };
  };

  const createFailedRes = function <
    B extends keyof (typeof BUSINESS_LOGICS)[T],
  >(businessLogicCode: B): ServiceResponse<never> {
    return {
      success: false,
      message: businessLogicCode,
    };
  };

  return { createSuccessRes, createFailedRes };
}