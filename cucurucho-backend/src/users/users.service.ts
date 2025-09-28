import { Injectable, BadRequestException } from '@nestjs/common'; // <-- Importa BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    // --- CORRECCIÓN ---
    // 1. Verificamos que la contraseña exista. Si no, lanzamos un error claro.
    if (!userData.password) {
      throw new BadRequestException('La contraseña es obligatoria.');
    }

    const salt = await bcrypt.genSalt();
    // 2. Ahora TypeScript sabe que userData.password es un string.
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 3. Creamos el objeto para la base de datos de forma segura.
    const userToCreate = {
      username: userData.username,
      role: userData.role,
      password_hash: hashedPassword, // Mapeamos al campo correcto de la entidad
    };

    const newUser = this.usersRepository.create(userToCreate);

    // 4. Guardamos el nuevo usuario.
    return this.usersRepository.save(newUser);
  }
}