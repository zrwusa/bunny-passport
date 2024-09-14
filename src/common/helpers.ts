import {
  CONTROLLER_BUSINESS_LOGICS,
  SERVICE_BUSINESS_LOGICS,
} from './constants';

export function createServiceResponseHandlers<
  M extends keyof typeof SERVICE_BUSINESS_LOGICS,
>(method: M) {
  const buildSuccessResponse = function <
    B extends keyof (typeof SERVICE_BUSINESS_LOGICS)[M],
    D,
  >(serviceBusinessLogicCode: B, data?: D) {
    return {
      success: true,
      message: SERVICE_BUSINESS_LOGICS[method][serviceBusinessLogicCode]['en'],
      serviceBusinessLogicCode: serviceBusinessLogicCode,
      data,
    };
  };

  const buildFailureResponse = function <
    B extends keyof (typeof SERVICE_BUSINESS_LOGICS)[M],
  >(serviceBusinessLogicCode: B) {
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
  >(serviceBusinessLogicCode: B, data?: D) {
    return {
      success: true,
      message:
        CONTROLLER_BUSINESS_LOGICS[method][serviceBusinessLogicCode]['en'],
      controllerBusinessLogicCode: serviceBusinessLogicCode,
      data,
    };
  };

  // const buildFailureResponse = function <
  //   B extends keyof (typeof CONTROLLER_BUSINESS_LOGICS)[M],
  // >(serviceBusinessLogicCode: B) {
  //   return {
  //     success: false,
  //     message:
  //       CONTROLLER_BUSINESS_LOGICS[method][serviceBusinessLogicCode]['en'],
  //     controllerBusinessLogicCode: serviceBusinessLogicCode,
  //     data: null,
  //   };
  // };

  return { buildSuccessResponse };
}
