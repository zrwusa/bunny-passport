// src/auth/dto/login.dto.ts
import { EmailField, PasswordField } from '../../../common/decorators';

export class LoginDto {
  @EmailField('user')
  email!: string;

  @PasswordField('user')
  password!: string;
}
