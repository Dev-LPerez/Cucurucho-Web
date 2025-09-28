import { UserRole } from '../user.entity';

export class CreateUserDto {
  username: string;
  password?: string; // Hacemos la contraseña opcional aquí
  role: UserRole;
}