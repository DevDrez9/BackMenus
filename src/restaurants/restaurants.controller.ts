import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // --- RUTAS PRIVADAS (Requieren Token) ---

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createRestaurantDto: CreateRestaurantDto) {
    // req.user.userId viene del token decodificado
    return this.restaurantsService.create(req.user.userId, createRestaurantDto);
  }

  @Get('my-restaurants')
  @UseGuards(JwtAuthGuard)
  findMyRestaurants(@Request() req) {
    return this.restaurantsService.findAllByOwner(req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    // TODO: Validar que el usuario sea dueño de este restaurante antes de actualizar
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
     // TODO: Validar ownership
    return this.restaurantsService.remove(id);
  }

  // --- RUTAS PÚBLICAS (Cualquiera puede ver el menú) ---

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.restaurantsService.findBySlug(slug);
  }
}