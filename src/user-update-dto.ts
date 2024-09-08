// src/user-update-dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateDto {
  @ApiProperty({
    description: 'The name of the user',
    minLength: 3,
    maxLength: 20,
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The new password of the user (optional)',
    example: 'NewPassword123!',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'The old password (required for updating password)',
    example: 'OldPassword123!',
    required: false,
  })
  oldPassword?: string;
}
