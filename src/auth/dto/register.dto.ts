// src/auth/dto/register.dto.ts
import {
  EmailField,
  PasswordField,
  UsernameField,
} from '../../common/decorators';

export class RegisterDto {
  @UsernameField('user')
  username: string;

  @EmailField('user')
  email!: string;

  @PasswordField('user')
  password!: string;
}
