import { Controller, Get, Post, Body, UseGuards, ValidationPipe, Param, Patch } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from './table.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body(new ValidationPipe()) createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAll() {
    return this.tablesService.findAll();
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  updateStatus(@Param('id') id: string, @Body('status') status: TableStatus) {
    return this.tablesService.updateStatus(+id, status);
  }
}

