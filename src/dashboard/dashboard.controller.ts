import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req) {
    // Pasamos el ID y el Rol para decidir qué datos mostrar
    return this.dashboardService.getStats(req.user.userId, req.user.role);
  }
}