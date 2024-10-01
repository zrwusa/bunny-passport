// src/response-user.dto.ts
import {
  CreatedAtField,
  EmailField,
  IdField,
  UpdatedAtField,
  UsernameField,
} from '../../../common';

export class ResponseUserDto {
  @IdField('user')
  id!: string;

  @UsernameField('user')
  username: string;

  @EmailField('user')
  email!: string;

  @CreatedAtField('user')
  createdAt!: Date;

  @UpdatedAtField('user')
  updatedAt!: Date;
}
