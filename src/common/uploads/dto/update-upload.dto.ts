import { PartialType } from '@nestjs/mapped-types';
import { UploadImageDto } from './create-upload.dto';

export class UpdateUploadDto extends PartialType(UploadImageDto) {}
