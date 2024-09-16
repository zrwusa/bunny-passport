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
  M extends keyof typeof SERVICE_BUSINESS_LOGICS,
  D,
> = {
  success: boolean;
  serviceBusinessLogicCode: keyof (typeof SERVICE_BUSINESS_LOGICS)[M];
  message: string;
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
