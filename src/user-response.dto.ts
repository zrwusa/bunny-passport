import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user', example: 1 })
  id!: number;

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
    description: 'The date and time when the user was created',
    example: '2024-09-06T12:34:56Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time when the user was last updated',
    example: '2024-09-06T12:34:56Z',
  })
  updatedAt!: Date;
}
