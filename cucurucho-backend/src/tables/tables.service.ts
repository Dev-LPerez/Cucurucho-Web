import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table, TableStatus } from './table.entity';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
  ) {}

  create(createTableDto: CreateTableDto): Promise<Table> {
    const table = this.tablesRepository.create(createTableDto);
    return this.tablesRepository.save(table);
  }

  findAll(): Promise<Table[]> {
    return this.tablesRepository.find();
  }

  async updateStatus(id: number, status: TableStatus): Promise<Table> {
    const table = await this.tablesRepository.findOneBy({ id });
    if (!table) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada.`);
    }
    table.status = status;
    return this.tablesRepository.save(table);
  }

  async updateTable(id: number, tableData: Partial<CreateTableDto>): Promise<Table> {
    const table = await this.tablesRepository.findOneBy({ id });
    if (!table) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada.`);
    }
    Object.assign(table, tableData);
    return this.tablesRepository.save(table);
  }

  async deleteTable(id: number): Promise<void> {
    const result = await this.tablesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada.`);
    }
  }
}
