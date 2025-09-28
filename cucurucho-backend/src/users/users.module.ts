// cucurucho-backend/src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity'; // <-- 1. Importa la entidad

@Module({
  imports: [TypeOrmModule.forFeature([User])], // <-- 2. Añade esto para registrar la entidad
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}