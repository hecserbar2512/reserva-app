import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { CustomersService } from '../customers/customers.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly customersService: CustomersService,
  ) { }

  findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  private validateDate(dateStr: string): string | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date('2027-12-31');
    const inputDate = new Date(dateStr);

    if (isNaN(inputDate.getTime())) {
      return 'Formato de fecha inválido';
    }

    if (inputDate < today) {
      return 'No se pueden registrar cobros en el pasado';
    }

    if (inputDate > maxDate) {
      return 'La fecha máxima permitida es el 31 de diciembre de 2027';
    }

    return null;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<any> {
    const { clientName, date } = createPaymentDto;

    const dateError = this.validateDate(date);
    if (dateError) {
      return { error: dateError };
    }

    // Check if customer exists by name
    const customers = await this.customersService.findAll();
    const customerExists = customers.some(c => c.name === clientName);

    if (!customerExists) {
      return { error: 'El cliente no existe en el sistema' };
    }

    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<any> {
    if (updatePaymentDto.date) {
      const dateError = this.validateDate(updatePaymentDto.date);
      if (dateError) {
        return { error: dateError };
      }
    }

    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}
