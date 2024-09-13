import { BusinessLogicNotificationCode } from '../types/i18n';

export interface ServiceResponse<T> {
  success: boolean; // success sign
  data?: T; // Business data (if successful)
  message?: string | number | symbol; // error or success message
  businessLogicCode?: BusinessLogicNotificationCode; // error code (optional)
}