import { IdField } from '../../../common/decorators';

export class DeleteUserDto {
  @IdField('user')
  id!: string;
}