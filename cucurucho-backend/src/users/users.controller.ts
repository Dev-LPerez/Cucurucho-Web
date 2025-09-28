import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // <-- 1. Importa el DTO

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    // 2. Usa el DTO para tipar y validar el body de la petición
    async register(@Body() userData: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
        const user = await this.usersService.create(userData);

        const { password_hash, ...result } = user;
        return result;
    }
}