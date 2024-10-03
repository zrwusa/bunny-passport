import { BlResponseCreator } from 'bunny-common';
import { SERVICE_BUSINESS_LOGICS } from '../constants';

export const serviceResponseCreator = new BlResponseCreator(
  SERVICE_BUSINESS_LOGICS,
  'bunny-passport',
  'service',
);
