import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createRestaurantDto: CreateRestaurantDto) {
    // 1. Intentar generar Slug (Si existe, lanzará error aquí mismo)
    const slug = await this.generateSlug(createRestaurantDto.name);

    // 2. Buscar el Plan GRATIS por defecto
    const freePlan = await this.prisma.plan.findFirst({
      where: { price: 0 }, 
    });

    // 3. Crear restaurante
    return this.prisma.restaurant.create({
      data: {
        ...createRestaurantDto,
        slug,
        userId, 
        subscription: freePlan ? {
          create: {
            planId: freePlan.id,
            status: 'ACTIVE',
          }
        } : undefined,
      },
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    });
  }

  async findAllByOwner(userId: string) {
    return this.prisma.restaurant.findMany({
      where: { userId },
      include: {
        images: true, 
        subscription: { include: { plan: true } }, 
      },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { 
        images: true,
        subscription: { include: { plan: true } }
      },
    });
    if (!restaurant) throw new NotFoundException(`Restaurante no encontrado`);
    return restaurant;
  }
  
  async findBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
      include: { 
        images: true,
        menus: { where: { isActive: true } }
      },
    });
    if (!restaurant) throw new NotFoundException(`Restaurante no encontrado`);
    return restaurant;
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    // Si se actualiza el nombre, deberíamos verificar si el nuevo slug está disponible
    // Opcional: Podrías decidir NO actualizar el slug al editar para no romper QRs existentes.
    // En este caso, mantenemos la lógica simple de Prisma, pero si quisieras regenerar slug:
    /*
    if (updateRestaurantDto.name) {
        const newSlug = await this.generateSlug(updateRestaurantDto.name);
        // ... update data: { ... slug: newSlug }
    }
    */
    
    try {
        return await this.prisma.restaurant.update({
            where: { id },
            data: updateRestaurantDto,
        });
    } catch (error) {
        throw new NotFoundException('Restaurante no encontrado');
    }
  }

  async remove(id: string) {
    return this.prisma.restaurant.delete({ where: { id } });
  }

  // Lógica de Slug estricta
  private async generateSlug(name: string): Promise<string> {
    let slug = name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Quitar caracteres especiales
      .replace(/[\s_-]+/g, '-') // Espacios a guiones
      .replace(/^-+|-+$/g, ''); // Quitar guiones iniciales/finales

    // Verificar si existe
    const exists = await this.prisma.restaurant.findUnique({ where: { slug } });
    
    if (exists) {
      // CAMBIO: Ahora bloqueamos la creación en lugar de agregar números raros
      throw new ConflictException(
        `El nombre "${name}" ya está en uso (URL: /${slug}). Por favor agrega una distinción (ej: "${name} Centro").`
      );
    }
    
    return slug;
  }
}