import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMenuDto: CreateMenuDto) {
    // 1. Verificar que el restaurante exista y pertenezca al usuario (seguridad)
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createMenuDto.restaurantId },
      include: { subscription: { include: { plan: true } } }
    });

    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    if (restaurant.userId !== userId) throw new BadRequestException('No eres el dueño de este restaurante');

    // 2. Crear el menú
    const menu = await this.prisma.menu.create({
      data: createMenuDto,
    });

    // 3. Lógica de Plan: Si el plan NO tiene secciones (hasSections: false),
    // creamos una categoría "General" oculta automáticamente para meter los platos ahí.
    const plan = restaurant.subscription?.plan;
    if (plan && !plan.hasSections) {
        await this.prisma.category.create({
            data: {
                name: 'General', // Nombre interno
                menuId: menu.id,
                order: 0
            }
        });
    }

    return menu;
  }

  async findAllByRestaurant(restaurantId: string) {
    return this.prisma.menu.findMany({
      where: { restaurantId },
    });
  }

  // Esta es la consulta MÁS IMPORTANTE para el cliente final
  async findOneFull(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { order: 'asc' }, // Ordenamos las categorías (Entradas, Platos...)
          include: {
            products: {
              where: { isAvailable: true }, // Solo platos disponibles
              include: {
                images: true // Fotos del plato
              }
            }
          }
        }
      }
    });

    if (!menu) throw new NotFoundException('Menú no encontrado');
    return menu;
  }

  async update(id: string, userId: string, updateMenuDto: UpdateMenuDto) {
    // Verificar propiedad antes de actualizar
    await this.validateOwnership(id, userId);

    return this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.validateOwnership(id, userId);
    return this.prisma.menu.delete({ where: { id } });
  }

  // Helper para validar seguridad
  private async validateOwnership(id: string, userId: string) {
    const menu = await this.prisma.menu.findUnique({
        where: { id },
        include: { restaurant: true }
    });
    if (!menu) throw new NotFoundException('Menú no encontrado');
    if (menu.restaurant.userId !== userId) throw new BadRequestException('No tienes permiso');
  }
}