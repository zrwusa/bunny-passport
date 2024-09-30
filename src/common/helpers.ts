// src/common/helpers.ts
import {
  CONTROLLER_BUSINESS_LOGICS,
  SERVICE_BUSINESS_LOGICS,
} from './constants';
import {
  BlStack,
  ControllerResponse,
  ServiceCode,
  ServiceMethod,
} from '../types';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

function isServiceMethodArray(
  methodOrMethods: ServiceMethod | ServiceMethod[],
): methodOrMethods is ServiceMethod[] {
  return Array.isArray(methodOrMethods);
}

export function createServiceResponseHandlers<
  M extends ServiceMethod | ServiceMethod[],
>(methodOrMethods: M) {
  const buildResponse = <
    C extends M extends ServiceMethod[]
      ? ServiceCode<M[number]>
      : M extends ServiceMethod
        ? ServiceCode<M>
        : never,
    D = undefined,
  >(
    serviceBusinessLogicCode: C,
    success: boolean,
    data?: D,
  ) => {
    const res = {
      success,
      blStack: [] as BlStack,
      serviceBusinessLogicCode,
      data,
    };

    if (isServiceMethodArray(methodOrMethods)) {
      methodOrMethods.forEach((method) => {
        const methodLogic = SERVICE_BUSINESS_LOGICS[method];
        if (serviceBusinessLogicCode in methodLogic) {
          res.blStack.push({
            method,
            message:
              methodLogic[serviceBusinessLogicCode as keyof typeof methodLogic][
                'en'
              ],
          });
        }
      });
    } else {
      const method = methodOrMethods as ServiceMethod;
      const methodLogic = SERVICE_BUSINESS_LOGICS[method];
      if (serviceBusinessLogicCode in methodLogic) {
        res.blStack.push({
          method,
          message:
            methodLogic[serviceBusinessLogicCode as keyof typeof methodLogic][
              'en'
            ],
        });
      }
    }

    return res;
  };

  const buildSuccessResponse = <
    C extends M extends ServiceMethod[]
      ? ServiceCode<M[number]>
      : M extends ServiceMethod
        ? ServiceCode<M>
        : never,
    D = undefined,
  >(
    serviceBusinessLogicCode: C,
    data?: D,
  ) => {
    return buildResponse(serviceBusinessLogicCode, true, data);
  };

  const buildFailureResponse = <
    C extends M extends ServiceMethod[]
      ? ServiceCode<M[number]>
      : M extends ServiceMethod
        ? ServiceCode<M>
        : never,
    D = undefined,
  >(
    serviceBusinessLogicCode: C,
    data?: D,
  ) => {
    return buildResponse(serviceBusinessLogicCode, false, data);
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
