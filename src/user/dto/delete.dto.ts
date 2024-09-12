import { IdField } from '../../common/decorators';

export class DeleteDto {
  @IdField('user')
  id!: string;
}