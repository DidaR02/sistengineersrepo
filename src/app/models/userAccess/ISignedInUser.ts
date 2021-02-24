import { User } from './IUser';
import { UserAcess } from './IUserAcess';

export interface SignedInUser {
    Uid: string;
    User: User;
    UserAccess: UserAcess;
 }