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
