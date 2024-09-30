import {
  CONTROLLER_BUSINESS_LOGICS,
  SERVICE_BUSINESS_LOGICS,
} from '../common/constants';
import { SecondLevelKeys } from './utils';

export type ServiceBusinessLogicCode = SecondLevelKeys<
  typeof SERVICE_BUSINESS_LOGICS
>;

export type ControllerBusinessLogicCode = SecondLevelKeys<
  typeof CONTROLLER_BUSINESS_LOGICS
>;

export type TranslateBusinessLogicFrom = 'service' | 'controller';

export type TranslateRes = {
  success: boolean;
  translated: string;
};

export type ServiceResponse<
  M extends ServiceMethod | ServiceMethod[],
  D = undefined,
> = {
  success: boolean;
  serviceBusinessLogicCode: keyof (typeof SERVICE_BUSINESS_LOGICS)[M];
  blStack: ServiceBlStack;
  data?: D;
};

export type ControllerResponse<
  M extends ControllerMethod | ControllerMethod[],
  D = undefined,
> = {
  success: boolean;
  controllerBusinessLogicCode: keyof (typeof CONTROLLER_BUSINESS_LOGICS)[M];
  blStack: ControllerBlStack;
  data?: D;
};

export type ServiceMethod = keyof typeof SERVICE_BUSINESS_LOGICS;
export type ServiceBlStack = { method: ServiceMethod; message: string }[];

// The writing of M extends any here forces TypeScript to apply the conditional type individually to each member of the union type, thereby obtaining the keys of each service and union them
export type ServiceCode<M extends ServiceMethod> = M extends any
  ? keyof (typeof SERVICE_BUSINESS_LOGICS)[M]
  : never;

export type ControllerMethod = keyof typeof CONTROLLER_BUSINESS_LOGICS;
export type ControllerBlStack = { method: ControllerMethod; message: string }[];

// The writing of M extends any here forces TypeScript to apply the conditional type individually to each member of the union type, thereby obtaining the keys of each service and union them
export type ControllerCode<M extends ControllerMethod> = M extends any
  ? keyof (typeof CONTROLLER_BUSINESS_LOGICS)[M]
  : never;
