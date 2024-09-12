import { Request as ExpressReq } from 'express';
import { User } from '../../user/user.entity';

export type ExpressReqWithUser = ExpressReq & { user: User };
