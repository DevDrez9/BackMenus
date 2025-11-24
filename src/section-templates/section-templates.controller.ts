import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SectionTemplatesService } from './section-templates.service';
import { CreateSectionTemplateDto } from './dto/create-section-template.dto';
import { UpdateSectionTemplateDto } from './dto/update-section-template.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('section-templates')
export class SectionTemplatesController {
  constructor(private readonly sectionTemplatesService: SectionTemplatesService) {}

  // --- ENDPOINTS ADMIN ---

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateSectionTemplateDto) {
    return this.sectionTemplatesService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.sectionTemplatesService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateSectionTemplateDto) {
    return this.sectionTemplatesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.sectionTemplatesService.remove(id);
  }

  // --- ENDPOINTS USUARIO ---

  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard)
  findAllByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.sectionTemplatesService.findAllByRestaurant(restaurantId);
  }
}