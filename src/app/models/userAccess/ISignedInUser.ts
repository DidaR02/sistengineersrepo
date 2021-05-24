import { User } from './IUser';
import { UserAccess } from './IUserAccess';

export interface SignedInUser {
    Uid: string;
    User: User;
    UserAccess: UserAccess;
 }