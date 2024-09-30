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
  M extends
    | keyof typeof SERVICE_BUSINESS_LOGICS
    | (keyof typeof SERVICE_BUSINESS_LOGICS)[],
  D = undefined,
> = {
  success: boolean;
  serviceBusinessLogicCode: keyof (typeof SERVICE_BUSINESS_LOGICS)[M];
  blStack: BlStack;
  data?: D | null;
};

export type ControllerResponse<
  M extends keyof typeof CONTROLLER_BUSINESS_LOGICS,
  D = undefined,
> = {
  success: boolean;
  controllerBusinessLogicCode: keyof (typeof CONTROLLER_BUSINESS_LOGICS)[M];
  message: string;
  data?: D | null;
};

export type ServiceMethod = keyof typeof SERVICE_BUSINESS_LOGICS;
export type BlStack = { method: ServiceMethod; message: string }[];

// The writing of M extends any here forces TypeScript to apply the conditional type individually to each member of the union type, thereby obtaining the keys of each service and union them
export type ServiceCode<M extends ServiceMethod> = M extends any
  ? keyof (typeof SERVICE_BUSINESS_LOGICS)[M]
  : never;