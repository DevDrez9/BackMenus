import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrUpdate(@Request() req, @Body() createSubscriptionDto: CreateSubscriptionDto) {
    // CORRECCIÓN: Pasamos el objeto usuario completo (req.user) para tener acceso al rol
    return this.subscriptionsService.subscribe(req.user, createSubscriptionDto);
  }

  @Get('restaurant/:restaurantId')
  findOne(@Param('restaurantId') restaurantId: string) {
    return this.subscriptionsService.findOneByRestaurant(restaurantId);
  }

  @Patch('cancel/:restaurantId')
  @UseGuards(JwtAuthGuard)
  cancel(@Request() req, @Param('restaurantId') restaurantId: string) {
    // También pasamos el usuario completo aquí por consistencia
    return this.subscriptionsService.cancel(req.user, restaurantId);
  }
}