import { Request } from 'express';
import { User } from '../../../business/user/user.entity';

export type ExpressReqWithUser = Request & { user: User };