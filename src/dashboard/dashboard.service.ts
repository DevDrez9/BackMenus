import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.getAdminStats();
    } else {
      return this.getOwnerStats(userId);
    }
  }

  // Estadísticas Globales para el Super Admin
  private async getAdminStats() {
    const [totalUsers, totalRestaurants, totalPlans, activeSubs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.restaurant.count(),
      this.prisma.plan.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      type: 'ADMIN',
      cards: [
        { label: 'Usuarios Totales', value: totalUsers, icon: 'Users', color: 'blue' },
        { label: 'Restaurantes', value: totalRestaurants, icon: 'Store', color: 'indigo' },
        { label: 'Suscripciones Activas', value: activeSubs, icon: 'CreditCard', color: 'green' },
        { label: 'Planes Configurados', value: totalPlans, icon: 'FileText', color: 'gray' },
      ]
    };
  }

  // Estadísticas Personales para el Dueño
  private async getOwnerStats(userId: string) {
    // 1. Traemos todos los restaurantes del usuario con sus planes
    const restaurants = await this.prisma.restaurant.findMany({
      where: { userId },
      include: {
        subscription: { include: { plan: true } }
      }
    });

    let totalRestaurants = restaurants.length;
    let totalProductsUsed = 0;
    let totalProductsLimit: number | null = 0; // null indicará infinito
    
    let totalImagesUsed = 0;
    let totalImagesLimit = 0;

    // 2. Iteramos para sumar consumos y límites
    for (const r of restaurants) {
      // --- CONTAR PRODUCTOS ---
      const productsCount = await this.prisma.product.count({
        where: { category: { menu: { restaurantId: r.id } } }
      });
      totalProductsUsed += productsCount;

      // Sumar límite del plan (si es null, todo se vuelve infinito)
      const planLimit = r.subscription?.plan?.maxProducts;
      if (totalProductsLimit !== null) {
        if (planLimit === null || planLimit === undefined) {
          totalProductsLimit = null; // Se vuelve infinito
        } else {
          totalProductsLimit += planLimit;
        }
      }

      // --- CONTAR IMÁGENES DESTACADAS ---
      const imagesCount = await this.prisma.image.count({
        where: { restaurantId: r.id }
      });
      totalImagesUsed += imagesCount;
      
      // Sumar límite de imágenes
      const imgLimit = r.subscription?.plan?.maxHighlightImages || 0;
      totalImagesLimit += imgLimit;
    }

    // Formatear textos (Ej: "5 / 20" o "15 / ∞")
    const productsValue = totalProductsLimit === null 
      ? `${totalProductsUsed} / ∞` 
      : `${totalProductsUsed} / ${totalProductsLimit}`;

    const imagesValue = `${totalImagesUsed} / ${totalImagesLimit}`;

    return {
      type: 'OWNER',
      cards: [
        { label: 'Mis Restaurantes', value: totalRestaurants, icon: 'Utensils', color: 'indigo' },
        { label: 'Platos Creados (Uso/Plan)', value: productsValue, icon: 'Coffee', color: 'orange' },
        { label: 'Imágenes Destacadas', value: imagesValue, icon: 'Image', color: 'blue' }, // Usamos icono 'Image'
      ]
    };
  }
}