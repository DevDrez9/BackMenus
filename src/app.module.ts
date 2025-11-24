import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MenusModule } from './menus/menus.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UploadsModule } from './common/uploads/uploads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SectionTemplatesModule } from './section-templates/section-templates.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, RestaurantsModule, ReviewsModule, MenusModule, CategoriesModule, ProductsModule, PlansModule, SubscriptionsModule, UploadsModule, AnalyticsModule, SectionTemplatesModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
