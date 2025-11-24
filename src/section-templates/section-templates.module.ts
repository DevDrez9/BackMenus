import { Module } from '@nestjs/common';
import { SectionTemplatesService } from './section-templates.service';
import { SectionTemplatesController } from './section-templates.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SectionTemplatesController],
  providers: [SectionTemplatesService],
})
export class SectionTemplatesModule {}
