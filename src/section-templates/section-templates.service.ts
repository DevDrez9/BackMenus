import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSectionTemplateDto } from './dto/create-section-template.dto';
import { UpdateSectionTemplateDto } from './dto/update-section-template.dto';

@Injectable()
export class SectionTemplatesService {
  constructor(private prisma: PrismaService) {}

  // Crear (Admin)
  async create(createSectionTemplateDto: CreateSectionTemplateDto) {
    return this.prisma.sectionTemplate.create({
      data: createSectionTemplateDto,
    });
  }

  // Listar Todo (Admin)
  async findAll() {
    return this.prisma.sectionTemplate.findMany({
      include: { plan: true },
      orderBy: { plan: { price: 'asc' } }, // Ordenado por nivel de plan
    });
  }

  // Actualizar (Admin)
  async update(id: string, updateDto: UpdateSectionTemplateDto) {
    return this.prisma.sectionTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  // Eliminar (Admin)
  async remove(id: string) {
    return this.prisma.sectionTemplate.delete({ where: { id } });
  }

  // --- MÉTODOS PÚBLICOS / USUARIO ---

  async findAllByRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { subscription: { include: { plan: true } } }
    });

    if (!restaurant || !restaurant.subscription?.plan) {
      return this.prisma.sectionTemplate.findMany({
        where: { plan: { price: 0 } }
      });
    }

    const currentPlanPrice = restaurant.subscription.plan.price;

    return this.prisma.sectionTemplate.findMany({
      where: {
        plan: {
          price: { lte: currentPlanPrice }
        }
      },
      orderBy: { plan: { price: 'asc' } }
    });
  }
}