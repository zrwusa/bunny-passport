// src/common/helpers.ts
import {
  CONTROLLER_BUSINESS_LOGICS,
  SERVICE_BUSINESS_LOGICS,
} from '../constants';
import {
  ControllerBlStack,
  ControllerCode,
  ControllerMethod,
  ServiceBlStack,
  ServiceCode,
  ServiceMethod,
} from '../../types';
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
      blStack: [] as ServiceBlStack,
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

function isControllerMethodArray(
  methodOrMethods: ControllerMethod | ControllerMethod[],
): methodOrMethods is ControllerMethod[] {
  return Array.isArray(methodOrMethods);
}

export function createControllerResponseHandlers<
  M extends ControllerMethod | ControllerMethod[],
>(methodOrMethods: M) {
  const buildResponse = <
    C extends M extends ControllerMethod[]
      ? ControllerCode<M[number]>
      : M extends ControllerMethod
        ? ControllerCode<M>
        : never,
    D = undefined,
  >(
    controllerBusinessLogicCode: C,
    success: boolean,
    data?: D,
  ) => {
    const res = {
      success,
      blStack: [] as ControllerBlStack,
      controllerBusinessLogicCode,
      data,
    };

    if (isControllerMethodArray(methodOrMethods)) {
      methodOrMethods.forEach((method) => {
        const methodLogic = CONTROLLER_BUSINESS_LOGICS[method];
        if (controllerBusinessLogicCode in methodLogic) {
          res.blStack.push({
            method,
            message:
              methodLogic[
                controllerBusinessLogicCode as keyof typeof methodLogic
              ]['en'],
          });
        }
      });
    } else {
      const method = methodOrMethods as ControllerMethod;
      const methodLogic = CONTROLLER_BUSINESS_LOGICS[method];
      if (controllerBusinessLogicCode in methodLogic) {
        res.blStack.push({
          method,
          message:
            methodLogic[
              controllerBusinessLogicCode as keyof typeof methodLogic
            ]['en'],
        });
      }
    }

    return res;
  };

  const buildSuccessResponse = <
    C extends M extends ControllerMethod[]
      ? ControllerCode<M[number]>
      : M extends ControllerMethod
        ? ControllerCode<M>
        : never,
    D = undefined,
  >(
    controllerBusinessLogicCode: C,
    data?: D,
  ) => {
    return buildResponse(controllerBusinessLogicCode, true, data);
  };

  const throwFailure = function <
    H extends new (...args: any[]) => HttpException,
    C extends M extends ControllerMethod[]
      ? ControllerCode<M[number]>
      : M extends ControllerMethod
        ? ControllerCode<M>
        : never,
  >(HttpExceptionClass: H, controllerBusinessLogicCode: C) {
    throw new HttpExceptionClass(controllerBusinessLogicCode);
  };

  return { buildSuccessResponse, throwFailure };
}
