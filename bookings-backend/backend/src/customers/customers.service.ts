import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<any> {
    const name = createCustomerDto.name?.trim();
    const email = createCustomerDto.email?.trim();
    const phone = createCustomerDto.phone?.trim();
    
    if (name) {
      const existingName = await this.customerRepository.findOne({ where: { name } });
      if (existingName) return { error: 'Este nombre de usuario esta registrado' };
    }

    if (email) {
      const existingEmail = await this.customerRepository.findOne({ where: { email } });
      if (existingEmail) return { error: 'Este email esta registrado' };
    }

    if (phone) {
      const existingPhone = await this.customerRepository.findOne({ where: { phone } });
      if (existingPhone) return { error: 'Este numero ya existe' };
    }

    const customer = this.customerRepository.create({ ...createCustomerDto, name, email, phone });
    return this.customerRepository.save(customer);
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<any> {
    const customer = await this.findOne(id);
    
    const name = updateCustomerDto.name?.trim();
    const email = updateCustomerDto.email?.trim();
    const phone = updateCustomerDto.phone?.trim();

    if (name && name !== customer.name) {
      const existingName = await this.customerRepository.findOne({ where: { name } });
      if (existingName) return { error: 'Este nombre de usuario esta registrado' };
    }

    if (email && email !== customer.email) {
      const existingEmail = await this.customerRepository.findOne({ where: { email } });
      if (existingEmail) return { error: 'Este email esta registrado' };
    }

    if (phone && phone !== customer.phone) {
      const existingPhone = await this.customerRepository.findOne({ where: { phone } });
      if (existingPhone) return { error: 'Este numero ya existe' };
    }

    Object.assign(customer, { ...updateCustomerDto, name, email, phone });
    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
