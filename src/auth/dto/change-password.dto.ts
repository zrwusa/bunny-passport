// src/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { EmailField, PasswordField, UsernameField } from '../../common';

export class ChangePasswordDto {
  @UsernameField('user')
  username?: string;

  @EmailField('user')
  email!: string;

  @PasswordField('user')
  password!: string;

  @ApiProperty({
    description: 'The old password (required for updating password)',
    example: 'Password123!',
    required: true,
  })
  oldPassword!: string;
}
