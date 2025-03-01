import { User } from './user.model';

export class ApiResponse {
  user: User;
  token: string;
  expires_in: number;
}
