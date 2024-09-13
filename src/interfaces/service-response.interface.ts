import { BusinessLogicCode } from '../types';

export interface ServiceResponse<T> {
  success: boolean; // success sign
  data?: T; // Business data (if successful)
  message?: string | number | symbol; // error or success message
  businessLogicCode?: BusinessLogicCode; // error code (optional)
}