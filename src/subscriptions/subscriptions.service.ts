import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  // CORRECCIÓN: Ahora recibimos el objeto usuario con rol
  async subscribe(user: { userId: string; role: string }, createSubscriptionDto: CreateSubscriptionDto) {
    const { restaurantId, planId } = createSubscriptionDto;

    // 1. Verificar que el restaurante existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    // 2. VALIDACIÓN DE PERMISOS:
    // Permitir si es el DUEÑO del restaurante O si es ADMIN global
    if (restaurant.userId !== user.userId && user.role !== 'ADMIN') {
      throw new BadRequestException('No tienes permiso para gestionar la suscripción de este restaurante');
    }

    // 3. Verificar que el plan existe
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('El plan seleccionado no existe');

    // 4. Calcular fechas
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // 5. UPSERT: Si no tiene plan (es nuevo), lo crea. Si tiene, lo actualiza.
    return this.prisma.subscription.upsert({
      where: { restaurantId },
      create: {
        restaurantId,
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
      },
      update: {
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
      },
      include: {
        plan: true,
      },
    });
  }

  async findOneByRestaurant(restaurantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { restaurantId },
      include: { plan: true },
    });
    
    // Si no tiene suscripción, retornamos null o lanzamos excepción según prefieras.
    // Para que el front no rompa, a veces es mejor devolver null si es opcional, 
    // pero aquí mantenemos la excepción si la lógica lo requiere.
    if (!subscription) throw new NotFoundException('Este restaurante no tiene suscripción activa');
    return subscription;
  }

  // También actualizamos el método de cancelar
  async cancel(user: { userId: string; role: string }, restaurantId: string) {
     const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
     
     if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

     // Validación de permisos (Dueño o Admin)
     if (restaurant.userId !== user.userId && user.role !== 'ADMIN') {
        throw new BadRequestException('Acción no permitida');
     }

     return this.prisma.subscription.update({
       where: { restaurantId },
       data: { status: 'CANCELED' }
     });
  }
}