import { ServiceResponse } from '../interfaces';
import { BUSINESS_LOGICS } from './constant';
import { BusinessLogicNotificationCode } from '../types';

export function getNotificationByLand(
  code: BusinessLogicNotificationCode,
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

export function businessLogicProtocol<T extends keyof typeof BUSINESS_LOGICS>(
  logicType: T,
) {
  const createServiceSuccessRes = function <
    B extends keyof (typeof BUSINESS_LOGICS)[T],
    D,
  >(notificationCode: B, data?: D): ServiceResponse<D> {
    return {
      success: true,
      message: notificationCode,
      data,
    };
  };

  const createServiceErrorRes = function <
    B extends keyof (typeof BUSINESS_LOGICS)[T],
  >(businessLogicCode: B): ServiceResponse<never> {
    return {
      success: false,
      message: businessLogicCode,
    };
  };

  return { createServiceSuccessRes, createServiceErrorRes };
}