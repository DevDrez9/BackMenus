import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { restaurantId, rating, comment } = createReviewDto;

    // 1. Verificar si el restaurante existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    // 2. (Opcional) Verificar si el usuario ya dejó una reseña
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        restaurantId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Ya has calificado este restaurante');
    }

    // 3. Crear la reseña
    return this.prisma.review.create({
      data: {
        rating,
        comment,
        restaurantId,
        userId,
      },
    });
  }

  // Obtener todas las reseñas de un restaurante (Público)
  async findAllByRestaurant(restaurantId: string) {
    return this.prisma.review.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: { name: true }, // Solo mostramos el nombre del usuario por privacidad
        },
      },
      orderBy: { createdAt: 'desc' }, // Las más recientes primero
    });
  }

  // Obtener mis reseñas (Privado)
  async findAllByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: { name: true, slug: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verificar que la reseña pertenezca al usuario antes de borrar
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.userId !== userId) throw new BadRequestException('No puedes eliminar esta reseña');

    return this.prisma.review.delete({ where: { id } });
  }
}