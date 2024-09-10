// src/auth/dto/logout.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'The refresh token which has been obtained when logged in',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inpyd2F1c0BnbWFpbC5jb20iLCJzdWIiOjEsImp0aSI6Ijc0MDAzMjgzLTdhNWEtNDc3MC04ZmI3LWRmNGE1YzU5MzM0NCIsInJ0aSI6IjRmZjJhMzljLWU5ZDUtNDI3NS1hMmE0LTM4YjZmN2IzYTExNiIsImlhdCI6MTcyNTk1NDA4MSwiZXhwIjoxNzI2NTU4ODgxfQ.Jbtiuaap6VHA_67FE6r-HDtYydLDjmZmTAK_K1c458k',
  })
  refresh_token!: string;
}
