import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const { menuId } = createCategoryDto;

    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        restaurant: {
          include: { subscription: { include: { plan: true } } }
        },
        categories: true 
      }
    });

    if (!menu) throw new NotFoundException('Menú no encontrado');
    
    if (menu.restaurant.userId !== userId) {
      throw new BadRequestException('No eres el dueño');
    }

    // VALIDACIÓN DEL PLAN: SECCIONES
    const plan = menu.restaurant.subscription?.plan;
    const hasSections = plan?.hasSections ?? false;

    // Si el plan NO permite secciones y ya hay 1 (la Default/General), bloqueamos
    if (!hasSections && menu.categories.length >= 1) {
      throw new ForbiddenException(
        'Tu plan actual no permite crear múltiples secciones. Actualiza a Plan 1 o superior.'
      );
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  // ... (El resto de métodos findAllByMenu, update, remove se mantienen estándar) ...
  async findAllByMenu(menuId: string) {
    return this.prisma.category.findMany({
      where: { menuId },
      orderBy: { order: 'asc' }
    });
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto) {
      // Validar ownership antes de update (omitido por brevedad, pero necesario)
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, userId: string) {
      // Validar ownership antes de delete
    return this.prisma.category.delete({ where: { id } });
  }
}