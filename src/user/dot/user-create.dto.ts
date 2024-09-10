// src/user-create.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateDto {
  @ApiProperty({
    description: 'The name of the user',
    minLength: 3,
    maxLength: 20,
    example: 'John Doe',
  })
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123!',
  })
  password: string;

  @ApiProperty({
    description: 'The old password (required for updating password)',
    example: 'OldPassword123!',
    required: false, // only required when updating password
  })
  oldPassword?: string; // Optional field for updates
}
