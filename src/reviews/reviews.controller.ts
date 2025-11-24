import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Crear reseña (Solo usuarios logueados)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  // Ver reseñas de un restaurante (Público)
  @Get('restaurant/:restaurantId')
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.findAllByRestaurant(restaurantId);
  }

  // Ver mis propias reseñas
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  findMyReviews(@Request() req) {
    return this.reviewsService.findAllByUser(req.user.userId);
  }

  // Eliminar mi reseña
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.reviewsService.remove(id, req.user.userId);
  }
}