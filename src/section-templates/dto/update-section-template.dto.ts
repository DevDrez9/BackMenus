import { PartialType } from '@nestjs/swagger';
import { CreateSectionTemplateDto } from './create-section-template.dto';

export class UpdateSectionTemplateDto extends PartialType(CreateSectionTemplateDto) {}
