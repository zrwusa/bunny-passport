// src/auth/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password123!',
  })
  password!: string;
}
