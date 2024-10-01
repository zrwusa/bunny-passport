// src/user/dto/create-user.dto.ts
import { EmailField, PasswordField, UsernameField } from '../../../common';

export class CreateUserDto {
  @UsernameField('user')
  username: string;

  @EmailField('user')
  email!: string;

  @PasswordField('user')
  password!: string;
}
