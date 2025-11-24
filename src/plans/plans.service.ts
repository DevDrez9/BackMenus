import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: createPlanDto,
    });
  }

  async findAll() {
    return this.prisma.plan.findMany({
      orderBy: { price: 'asc' }, // Ordenar del más barato al más caro
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    try {
      return await this.prisma.plan.update({
        where: { id },
        data: updatePlanDto,
      });
    } catch (error) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }
  }

  async remove(id: string) {
    try {
      // Nota: Esto fallará si hay suscripciones activas usando este plan (por seguridad de FK)
      return await this.prisma.plan.delete({
        where: { id },
      });
    } catch (error) {
      // Podrías capturar el error de Prisma P2003 (Foreign key constraint)
      throw new NotFoundException(`No se pudo eliminar el plan (posiblemente en uso o no existe)`);
    }
  }
}