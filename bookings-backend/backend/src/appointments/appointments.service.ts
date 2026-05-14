import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  findAll() {
    return this.appointmentsRepository.find({
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOneBy({ id });
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
      return 'No se pueden programar citas en el pasado';
    }

    if (inputDate > maxDate) {
      return 'La fecha máxima permitida es el 31 de diciembre de 2027';
    }

    return null;
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<any> {
    const dateError = this.validateDate(createAppointmentDto.date);
    if (dateError) {
      return { error: dateError };
    }

    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<any> {
    if (updateAppointmentDto.date) {
      const dateError = this.validateDate(updateAppointmentDto.date);
      if (dateError) {
        return { error: dateError };
      }
    }

    const appointment = await this.appointmentsRepository.findOneBy({ id });

    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }

    const updatedAppointment = this.appointmentsRepository.merge(
      appointment,
      updateAppointmentDto,
    );

    return this.appointmentsRepository.save(updatedAppointment);
  }

  async remove(id: number) {
    const appointment = await this.appointmentsRepository.findOneBy({ id });

    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }

    await this.appointmentsRepository.remove(appointment);

    return { message: `Reserva ${id} eliminada correctamente` };
  }
}