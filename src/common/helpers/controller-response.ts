// src/common/controller-response.ts
import { CONTROLLER_BUSINESS_LOGICS } from '../constants';

import { BlResponseCreator } from 'bunny-common';

export const controllerResponseCreator = new BlResponseCreator(
  CONTROLLER_BUSINESS_LOGICS,
  'bunny-passport',
  'controller',
);
