import { Request } from 'express';
import { User } from '../../user/user.entity';

export type ExpressReqWithUser = Request & { user: User };
