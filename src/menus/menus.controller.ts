import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // Crear Menú (Privado)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(req.user.userId, createMenuDto);
  }

  // Obtener todos los menús de un restaurante (Público, para ver opciones)
  @Get('restaurant/:restaurantId')
  findAllByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.menusService.findAllByRestaurant(restaurantId);
  }

  // Obtener Menú COMPLETO con categorías y productos (Público - Vista Cliente)
  @Get('public/:id')
  findOneFull(@Param('id') id: string) {
    return this.menusService.findOneFull(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, req.user.userId, updateMenuDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.menusService.remove(id, req.user.userId);
  }
}