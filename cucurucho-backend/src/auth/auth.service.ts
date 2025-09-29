import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    console.log(`--- Iniciando validación para usuario: ${username} ---`);
    const user = await this.usersService.findOne(username);

    if (!user) {
      console.log('Error de validación: Usuario no encontrado en la base de datos.');
      return null;
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password_hash);

    if (isPasswordMatching) {
      console.log('Resultado: ¡La contraseña COINCIDE!');
      const { password_hash, ...result } = user;
      return result;
    } else {
      console.log('Error de validación: La contraseña NO COINCIDE.');
      return null;
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}