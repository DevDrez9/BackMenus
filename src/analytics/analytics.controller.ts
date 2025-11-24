import { Controller, Get, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req) {
    const userId = req.user.userId;

    // 1. Buscar el restaurante del usuario (asumimos 1 por ahora para simplificar)
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { userId },
      include: { subscription: { include: { plan: true } } }
    });

    if (!restaurant) throw new NotFoundException('No tienes restaurantes');

    // 2. VALIDAR EL PLAN (Feature Flag)
    const plan = restaurant.subscription?.plan;
    if (!plan || !plan.hasAnalytics) {
      throw new ForbiddenException(
        'Tu plan actual no incluye Analíticas. Actualiza al Plan 3 para ver quién visita tu menú.'
      );
    }

    // 3. Si tiene permiso, devolvemos datos reales o simulados
    // Aquí podrías contar visitas reales si implementas un log de eventos
    const totalProducts = await this.prisma.product.count({
        where: { category: { menu: { restaurantId: restaurant.id } } }
    });
    
    const totalReviews = await this.prisma.review.count({
        where: { restaurantId: restaurant.id }
    });

    return {
      message: "Analíticas Premium",
      stats: {
        totalViews: 1250, // Dato simulado
        uniqueVisitors: 850, // Dato simulado
        totalProducts,
        totalReviews,
        popularDish: "Hamburguesa Doble" // Dato simulado
      }
    };
  }
}