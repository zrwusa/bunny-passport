export interface ServiceResponse<D, B> {
  success: boolean; // success sign
  data?: D; // Business data (if successful)
  message?: string | number | symbol; // error or success message
  serviceBusinessLogicCode: B; // error code (optional)
}
