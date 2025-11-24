import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    const { categoryId } = createProductDto;

    // 1. Obtener jerarquía
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        menu: {
          include: {
            restaurant: {
              include: { subscription: { include: { plan: true } } }
            }
          }
        }
      }
    });

    if (!category) throw new NotFoundException('Categoría no encontrada');
    const restaurant = category.menu.restaurant;

    if (restaurant.userId !== userId) {
      throw new BadRequestException('No tienes permiso');
    }

    // 2. VALIDAR LÍMITE DE CANTIDAD DE PLATOS (maxProducts)
    const plan = restaurant.subscription?.plan;
    
    // Si el plan tiene un límite numérico (si es null es ilimitado)
    if (plan && plan.maxProducts !== null) {
      // Contamos productos actuales
      const totalProducts = await this.prisma.product.count({
        where: {
          category: {
            menu: {
              restaurantId: restaurant.id
            }
          }
        }
      });

      if (totalProducts >= plan.maxProducts) {
        throw new ForbiddenException(
          `Tu plan ${plan.name} solo permite ${plan.maxProducts} platos. Actualiza tu plan.`
        );
      }
    }

    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAllByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: { images: true }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    // Validar propiedad (simplificado)
    const product = await this.prisma.product.findUnique({
        where: { id },
        include: { category: { include: { menu: { include: { restaurant: true } } } } }
    });
    if (!product || product.category.menu.restaurant.userId !== userId) {
        throw new BadRequestException('No autorizado');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string) {
     const product = await this.prisma.product.findUnique({
        where: { id },
        include: { category: { include: { menu: { include: { restaurant: true } } } } }
    });
    if (!product || product.category.menu.restaurant.userId !== userId) {
        throw new BadRequestException('No autorizado');
    }
    return this.prisma.product.delete({ where: { id } });
  }
}