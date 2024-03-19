import { User, UserSchema } from './user/models/user.schema';

export const MongoSchemas = [{ name: User.name, schema: UserSchema }];
