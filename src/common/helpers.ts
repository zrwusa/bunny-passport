// src/common/helpers.ts
import {
  CONTROLLER_BUSINESS_LOGICS,
  SERVICE_BUSINESS_LOGICS,
} from './constants';
import { ControllerResponse, ServiceResponse } from '../types';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

export function createServiceResponseHandlers<
  M extends keyof typeof SERVICE_BUSINESS_LOGICS,
>(method: M) {
  const buildSuccessResponse = function <
    B extends keyof (typeof SERVICE_BUSINESS_LOGICS)[M],
    D,
  >(serviceBusinessLogicCode: B, data?: D): ServiceResponse<M, D> {
    return {
      success: true,
      message: SERVICE_BUSINESS_LOGICS[method][serviceBusinessLogicCode]['en'],
      serviceBusinessLogicCode: serviceBusinessLogicCode,
      data,
    };
  };

  const buildFailureResponse = function <
    B extends keyof (typeof SERVICE_BUSINESS_LOGICS)[M],
  >(serviceBusinessLogicCode: B): ServiceResponse<M, null> {
    return {
      success: false,
      message: SERVICE_BUSINESS_LOGICS[method][serviceBusinessLogicCode]['en'],
      serviceBusinessLogicCode: serviceBusinessLogicCode,
      data: null,
    };
  };

  return { buildSuccessResponse, buildFailureResponse };
}

export function createControllerResponseHandlers<
  M extends keyof typeof CONTROLLER_BUSINESS_LOGICS,
>(method: M) {
  const buildSuccessResponse = function <
    B extends keyof (typeof CONTROLLER_BUSINESS_LOGICS)[M],
    D,
  >(controllerBusinessLogicCode: B, data?: D): ControllerResponse<M, D> {
    return {
      success: true,
      message:
        CONTROLLER_BUSINESS_LOGICS[method][controllerBusinessLogicCode]['en'],
      controllerBusinessLogicCode: controllerBusinessLogicCode,
      data,
    };
  };

  const throwFailure = function <
    H extends new (...args: any[]) => HttpException,
    B extends keyof (typeof CONTROLLER_BUSINESS_LOGICS)[M],
  >(HttpExceptionClass: H, controllerBusinessLogicCode: B) {
    throw new HttpExceptionClass(controllerBusinessLogicCode);
  };

  return { buildSuccessResponse, throwFailure };
}
